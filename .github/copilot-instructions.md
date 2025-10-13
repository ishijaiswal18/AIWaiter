# AIWaiter Project Instructions

## Architecture Overview

AIWaiter is a voice-enabled restaurant ordering system with four main components:

1. **Backend (JS)** (`backend/`) - Node.js/Express API using **MVP architecture** (Model-View-Presenter)
2. **Backend (TS)** (`ts_backend/`) - TypeScript/Express API with **Repository Pattern** and dependency injection
3. **Frontend** (`frontend/`) - React + Vite with Chakra UI
4. **AI Voice Agent** (`AIVoiceAgent/`) - Python LiveKit agent using Google Gemini Realtime API

### Data Flow
- Frontend ↔ Backend: REST API calls (`http://localhost:5000` for JS, `http://localhost:5001` for TS)
- Frontend ↔ LiveKit: WebSocket connection for voice (`wss://ai-waiter-c5qys2gz.livekit.cloud`)
- AI Agent ↔ Backend: HTTP calls to backend APIs via function tools
- AI Agent ↔ Frontend: LiveKit data messages for commands (navigation, cart updates)

## Backend Architectures

### JS Backend (MVP Pattern)
**Critical**: `backend/` uses **MVP (Model-View-Presenter)**, not MVC:

- **Models** (`models/`) - Data layer with mock data and query functions (e.g., `menuItem.getAll()`)
- **Views** (`views/`) - Express route handlers (e.g., `menuRoutes.js`)
- **Presenters** (`presenters/`) - Business logic layer between views and models (e.g., `menuPresenter.js`)

```javascript
// View → Presenter → Model
router.get('/', (req, res) => {
    const result = menuPresenter.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
});
```

**Never bypass the Presenter layer** - always route requests through Views → Presenters → Models.

### TypeScript Backend (Repository Pattern)
`ts_backend/` uses modern TypeScript with **Repository Pattern** and **Dependency Injection**:

- **Repositories** (`src/repositories/`) - Data access layer with interfaces and mock implementations
- **Services** (`src/services/`) - Business logic layer using `AppResponse<T>` standardized responses
- **Controllers** (`src/api/controllers/`) - HTTP request handling
- **Routes** (`src/api/routes/`) - Route definitions with Zod validation middleware

```typescript
// Route → Controller → Service → Repository
// Services are instantiated per-request to support test isolation
router.get('/', validate(schema), (req, res) => {
    const service = new MenuService(RepositoryFactory.getMenuRepository(), logger);
    const controller = new MenuController(service);
    controller.getMenu(req, res);
});
```

**Key Pattern**: Services created per-request (not singleton) to enable `RepositoryFactory.reset()` in tests.

**Response Format**: All services return `AppResponse<T>` from `types/common.ts`:
```typescript
interface AppResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
    status?: number;
}
```

## LiveKit Integration

### Token Generation Flow
1. Frontend requests token via `POST /get-token` with `{ roomName, participantName }`
2. Backend generates JWT using `livekit-server-sdk` AccessToken
3. Frontend connects to LiveKit room with token

### Voice Agent Function Tools
The Python agent uses `@function_tool()` decorated async functions in `AIVoiceAgent/tools/tools.py`:
- `get_menu()` - Fetches full menu from backend
- `get_specials()` - Gets special items
- `place_order(order_details)` - Creates order (format: `{userId, items: [{itemId, quantity}]}`)
- `get_order_status(order_id)` - Checks order status

### Frontend Command Handling
The agent sends data messages to control the frontend via `useLiveKit` hook:
```javascript
// Commands: { type: 'navigate', payload: '/menu' } or { type: 'add_to_cart', payload: item }
newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
    const message = JSON.parse(decoder.decode(payload));
    if (message.type === 'command') {
        handleCommand(message); // Triggers navigation or cart updates
    }
});
```

## Development Workflows

### Starting the Application
**Order matters** - backend must be running before agent:

```powershell
# Terminal 1 - Backend (choose one)
cd backend; npm install; npm start           # JS backend on port 5000
cd ts_backend; npm install; npm run dev      # TS backend on port 5001

# Terminal 2 - Frontend  
cd frontend; npm install; npm run dev

# Terminal 3 - AI Agent (after backend is up)
cd AIVoiceAgent; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python main.py --room my-agent-room
```

### TypeScript Backend Commands
```powershell
cd ts_backend
npm run dev          # Development with hot reload (ts-node-dev --files)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript from dist/
npm test             # Run Jest tests (--runInBand for serial execution)
npm run test:watch   # Watch mode for tests
npm run test:coverage # Generate coverage report
```

### Environment Variables Required
- **Backend (JS/TS)**: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `PORT` (5000 for JS, 5001 for TS)
- **AI Agent**: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_API_KEY`
- Frontend hardcodes LiveKit URL in `useLiveKit.js` (line 6)

## Key Conventions

### API Response Format
All presenters return structured responses:
```javascript
{ success: true, data: [...] }          // Success
{ success: false, message: string, status?: number }  // Error
```

### Logging Pattern
Use `utils/logger.js` for consistent logging:
```javascript
const { log, error } = require('../utils/logger');
log('Operation successful');
error(`Error: ${err.message}`);
```

### Cart Management
Frontend uses React Context (`context/CartContext.jsx`) for global cart state:
- `addToCart(item)` - Auto-increments quantity if item exists
- `updateQuantity(itemId, quantity)` - Removes if quantity ≤ 0
- `cartCount` and `total` are computed properties

### Mock Data Structure
Menu items in `models/menuItem.js`:
```javascript
{ id: 'm1', name: string, description: string, price: number, 
  category: string, type: 'veg'|'non-veg', isSpecial: boolean }
```

## Agent Customization

### Modifying Agent Behavior
Edit `AIVoiceAgent/prompts/prompts.py` for personality/instructions. Current persona: Traditional Indian restaurant waiter using "Namaste", "ji", "sahib/madam".

### Adding New Tools
1. Create async function in `tools/tools.py` with `@function_tool()` decorator
2. Add to `VoiceAgent.__init__()` tools list in `agents/voice_agent.py`
3. Document expected JSON format in docstring for LLM

## Testing (TypeScript Backend)

### Integration Tests
`ts_backend/tests/api/` contains comprehensive integration tests using Jest + Supertest:
- **33 tests** covering all endpoints (health, menu, order, user)
- Tests run serially (`--runInBand`) to prevent race conditions
- `beforeEach()` calls `RepositoryFactory.reset()` for test isolation
- **Critical**: Services created per-request (not cached) so tests get fresh repositories

### Test Patterns
```typescript
describe('Menu API', () => {
  beforeEach(() => {
    RepositoryFactory.reset(); // Fresh data for each test
  });

  it('should return all menu items', async () => {
    const response = await request(app).get('/api/menu');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

**Important**: HTTP 204 (No Content) responses have empty body - don't check `response.body.success`.

## Critical Files
- `backend/app.js` - JS backend Express app setup, LiveKit token endpoint
- `ts_backend/src/app.ts` - TS backend Express app with middleware chain
- `ts_backend/src/repositories/RepositoryFactory.ts` - Singleton factory with reset() for tests
- `ts_backend/src/types/common.ts` - AppResponse<T> standardized response type
- `ts_backend/jest.config.js` - Jest configuration with ts-jest
- `frontend/src/hooks/useLiveKit.js` - Complete LiveKit integration logic
- `AIVoiceAgent/main.py` - Agent entrypoint with backend health check
- `AIVoiceAgent/agents/voice_agent.py` - Agent class with Gemini Realtime model

## Common Pitfalls
- **JS Backend**: Don't use MVC terminology - it's MVP (Presenter, not Controller)
- **TS Backend**: Don't cache service instances at router creation - create per-request for test isolation
- **Testing**: Always use `--runInBand` to prevent parallel test race conditions
- **TypeScript**: Include `tests/**/*` in tsconfig.json for VS Code IntelliSense
- Always check backend health before starting agent (`main.py` does this)
- Audio issues? Frontend needs user interaction to play audio (browser autoplay policies)
- Agent tools must return strings, not raw response objects
