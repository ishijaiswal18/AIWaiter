# AIWaiter Project Instructions

## Development Workflow & Collaboration

### How We Work Together

This section documents the collaborative workflow between the developer (Anmol) and GitHub Copilot for this project.

#### 1. **Architectural Decision Making**
- **Developer leads architectural decisions** - Questions like "Is this over-engineering?" or "Do we really need DI?" drive major refactors
- **Copilot provides analysis** - Compare patterns, highlight trade-offs, suggest alternatives
- **Pragmatic approach** - YAGNI principle: only add complexity where there's a clear, concrete need
- **Example**: The shift from DIContainer to static methods was driven by questioning whether services/controllers actually need multiple implementations

#### 2. **Refactoring Process**
- **Use TODO lists for complex work** - Break down multi-step refactors into trackable tasks
- **Work systematically** - Complete one layer at a time (Repositories → Services → Controllers → Routes → Tests → Documentation)
- **Mark progress explicitly** - Update TODO status as each step completes
- **Run tests frequently** - Verify changes with `npm test` after major modifications

#### 3. **Code Quality Standards**
- **Enhanced logging** - Add LOG_SOURCE constants to all files for traceability (e.g., `const LOG_SOURCE = '[MenuService]'`)
- **Type safety first** - Strict TypeScript mode, no `any` types without justification
- **Consistent patterns** - Follow established patterns across similar files (all services use same structure)
- **Documentation in code** - JSDoc comments for public methods, clear variable names

#### 4. **Testing Philosophy**
- **Tests as requirements** - 33 integration tests define expected behavior
- **Test isolation is critical** - `RepositoryFactory.reset()` in `beforeEach()` ensures fresh state
- **Serial execution** - Use `--runInBand` to prevent race conditions
- **Test after refactoring** - Always run full test suite after architectural changes

#### 5. **Documentation Strategy**
- **Two-level documentation**:
  - `GEMINI.md` - Comprehensive technical reference with code examples
  - `copilot-instructions.md` - This file, focusing on patterns and conventions
- **Update docs with code** - Documentation changes are part of the refactoring process, not an afterthought
- **Capture rationale** - Document *why* decisions were made, not just *what* was implemented

#### 6. **Communication Patterns**
- **Ask clarifying questions** - "Do you want me to continue?" before large changes
- **Explain trade-offs** - Present pros/cons when multiple approaches exist
- **Show examples** - Code snippets demonstrate patterns better than descriptions
- **Acknowledge challenges** - "This approach has X downside but Y benefit"

#### 7. **Tool Usage Philosophy**
- **Prefer specialized tools** - Use `replace_string_in_file` for precise edits, not terminal commands
- **Read before modify** - Always read file context before making changes
- **Batch related changes** - Update all similar files (e.g., all routes) together when possible
- **Verify with tools** - Use `grep_search` to find all instances of patterns being changed

#### 8. **Iteration Approach**
- **Small, verifiable steps** - Make changes that can be tested immediately
- **Fail fast** - Run tests early to catch issues before they compound
- **Refactor with safety** - Tests passing before and after refactor
- **Challenge assumptions** - "Is this the simplest way?" and "Do we actually need this?"

### Key Lessons from This Project

1. **DI is for swapping, not creating** - Only repositories need interfaces because they'll actually be swapped (Mock → Postgres)
2. **Static methods for stateless logic** - Services/controllers don't need instantiation if they have no state
3. **60% code reduction is significant** - Removing boilerplate improves readability and maintainability
4. **Question popular patterns** - Just because everyone uses DI doesn't mean your project needs it
5. **YAGNI wins** - Add complexity when you need it, not because you might need it someday

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

### TypeScript Backend (Repository Pattern + Static Methods)
`ts_backend/` uses modern TypeScript with **Repository Pattern** for data access and **Static Methods** for services/controllers:

- **RepositoryFactory** (`src/repositories/RepositoryFactory.ts`) - Factory for repository creation with singleton pattern
- **Repositories** (`src/repositories/`) - Data access layer with interfaces and mock implementations
- **Services** (`src/services/`) - Business logic using **static methods** and `AppResponse<T>` standardized responses
- **Controllers** (`src/api/controllers/`) - HTTP request handling using **static methods**
- **Routes** (`src/api/routes/`) - Route definitions with Zod validation, calling static controller methods directly

```typescript
// Route → Static Controller → Static Service → RepositoryFactory → Repository
// Clean, simple, zero per-request overhead
router.get('/', validate(schema), MenuController.getMenu);

// In Controller (static method)
const logger = createLogger('MenuController');
static getMenu(req: Request, res: Response) {
    logger.info('GET /api/menu');  // requestId automatically included via AsyncLocalStorage
    const result = MenuService.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
}

// In Service (static method)
const logger = createLogger('MenuService');
static getMenu(): AppResponse<MenuItem[]> {
    const repository = RepositoryFactory.getMenuRepository();
    logger.info('Retrieved all menu items');
    return { success: true, data: repository.getAll() };
}
```

**Key Patterns**: 
- Only repositories use factory pattern (for Mock → Postgres swap)
- Services/controllers are stateless static methods
- **Logging uses AsyncLocalStorage** - No `req.log` or `LOG_SOURCE` strings needed

**Response Format**: All services return `AppResponse<T>` from `types/common.ts`:
```typescript
interface AppResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
    status?: number;
}
```

## Logging Architecture (TypeScript Backend)

### AsyncLocalStorage + Winston Pattern
The TS backend uses **AsyncLocalStorage** for automatic request context propagation with zero request object modifications:

**Key Benefits:**
- ✅ No `req.log` or `req.id` attached to request object
- ✅ Single pattern everywhere: `createLogger('SourceName')`
- ✅ Automatic requestId propagation through entire request lifecycle
- ✅ Concurrent request safe (verified with 50+ concurrent tests)
- ✅ Clean Express types with no custom properties

**Log Format:**
```
Console: [reqId:xxx] [source:MenuController]: GET /api/menu
JSON:    { "level": "info", "requestId": "xxx", "source": "MenuController", "message": "GET /api/menu" }
```

**Usage Pattern:**
```typescript
// Top of any file (middleware, controller, service)
import { createLogger } from '../utils/logger';
const logger = createLogger('MenuController');

// Use anywhere in that file - requestId automatically included!
logger.info('Processing request');
logger.error('Something failed', { error });
```

**How It Works:**
1. `requestIdMiddleware` creates unique requestId and wraps `next()` in `requestContext.run()`
2. AsyncLocalStorage automatically propagates context to all downstream code
3. Controllers, services, middleware all use `createLogger('SourceName')`
4. Winston child loggers automatically inject requestId from AsyncLocalStorage
5. Each concurrent request gets isolated context - no bleeding

**Source Names:**
- Middleware: `RequestIdMiddleware`, `ValidationMiddleware`, `ErrorHandler`
- Routes: `HealthCheck`
- Controllers: `MenuController`, `OrderController`, `UserController`
- Services: `MenuService`, `OrderService`, `UserService`

## LiveKit Integration

### Token Generation Flow (TypeScript Backend)
1. Frontend requests token via `POST /api/get-token` with `{ roomName, participantName }`
2. **Validation**: Zod middleware validates request body using `tokenRequestSchema`
3. **Controller**: `LiveKitController.getToken()` extracts parameters and calls service
4. **Service**: `LiveKitService.generateToken()` creates JWT using `livekit-server-sdk` AccessToken
5. Frontend connects to LiveKit room with token

**Endpoint**: `POST /api/get-token` (TS backend on port 5001)  
**JS Backend**: `POST /get-token` (JS backend on port 5000, no `/api` prefix)

**TypeScript Implementation Pattern**:
```typescript
// Route → Static Controller → Static Service → livekit-server-sdk
router.post('/get-token', validate(tokenRequestSchema), LiveKitController.getToken);

// Controller (static method)
static async getToken(req: Request, res: Response) {
    const { roomName, participantName } = req.body;
    const result = await LiveKitService.generateToken(roomName, participantName);
    res.status(result.success ? 200 : 500).json(result);
}

// Service (static method)
static async generateToken(roomName: string, participantName: string): Promise<AppResponse<{ token: string }>> {
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
    token.identity = participantName;
    token.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true });
    return { success: true, data: { token: await token.toJwt() } };
}
```

**JWT Structure**: `header.payload.signature` with claims:
- `sub`: participant identity
- `video.room`: room name
- `video.roomJoin/canPublish/canSubscribe`: permissions
- `iss`: LIVEKIT_API_KEY
- `exp/nbf`: expiration times

**Testing Pattern**:
```typescript
beforeEach(() => {
    // Mock credentials - livekit-server-sdk generates JWTs locally
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret';
});

// JWT validation test - decode payload and verify claims
const parts = token.split('.');
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
expect(payload.sub).toBe('test-participant');
expect(payload.video.room).toBe('test-room');
```

**Environment Variables Required**:
- `LIVEKIT_API_KEY` - API key from LiveKit dashboard
- `LIVEKIT_API_SECRET` - Secret for JWT signing (keep secure!)

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
- **37 tests** covering all endpoints (health, menu, order, user) + concurrent request scenarios
- Tests run serially (`--runInBand`) to prevent race conditions
- `beforeEach()` calls `RepositoryFactory.reset()` for test isolation
- **Concurrent tests** verify AsyncLocalStorage context isolation (no request bleeding)
- **Critical**: Static services/controllers use RepositoryFactory which provides fresh mock data

### Test Patterns
```typescript
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

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
- `ts_backend/src/services/LiveKitService.ts` - JWT token generation with livekit-server-sdk
- `ts_backend/src/api/controllers/LiveKitController.ts` - LiveKit token endpoint handler
- `ts_backend/src/api/routes/livekitRoutes.ts` - POST /api/get-token endpoint definition
- `ts_backend/src/repositories/RepositoryFactory.ts` - Repository factory with reset() for tests
- `ts_backend/src/types/common.ts` - AppResponse<T> standardized response type
- `ts_backend/src/types/validationSchemas.ts` - Zod schemas including tokenRequestSchema
- `ts_backend/src/utils/logger.ts` - Winston logger with AsyncLocalStorage context
- `ts_backend/jest.config.js` - Jest configuration with ts-jest
- `ts_backend/tests/api/livekit.test.ts` - 12 integration tests with JWT validation
- `frontend/src/hooks/useLiveKit.js` - Complete LiveKit integration logic
- `AIVoiceAgent/main.py` - Agent entrypoint with backend health check
- `AIVoiceAgent/agents/voice_agent.py` - Agent class with Gemini Realtime model

## Common Pitfalls
- **JS Backend**: Don't use MVC terminology - it's MVP (Presenter, not Controller)
- **TS Backend**: Always use RepositoryFactory for repositories - services/controllers are static methods
- **Testing**: Always use `--runInBand` to prevent parallel test race conditions
- **TypeScript**: Include `tests/**/*` in tsconfig.json for VS Code IntelliSense
- **LiveKit Testing**: Tests mock `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in `beforeEach()` - no real credentials needed
- **LiveKit Endpoint**: TS backend uses `/api/get-token`, JS backend uses `/get-token` (no `/api` prefix)
- **JWT Validation**: Use `Buffer.from(parts[1], 'base64')` to decode JWT payload for testing
- Always check backend health before starting agent (`main.py` does this)
- Audio issues? Frontend needs user interaction to play audio (browser autoplay policies)
- Agent tools must return strings, not raw response objects
