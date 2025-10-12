# AIWaiter Project Instructions

## Architecture Overview

AIWaiter is a voice-enabled restaurant ordering system with three main components:

1. **Backend** (`backend/`) - Node.js/Express API using **MVP architecture** (not MVC)
2. **Frontend** (`frontend/`) - React + Vite with Chakra UI
3. **AI Voice Agent** (`AIVoiceAgent/`) - Python LiveKit agent using Google Gemini Realtime API

### Data Flow
- Frontend ↔ Backend: REST API calls (`http://localhost:5000`)
- Frontend ↔ LiveKit: WebSocket connection for voice (`wss://ai-waiter-c5qys2gz.livekit.cloud`)
- AI Agent ↔ Backend: HTTP calls to backend APIs via function tools
- AI Agent ↔ Frontend: LiveKit data messages for commands (navigation, cart updates)

## MVP Architecture (Backend)

**Critical**: Backend uses **MVP (Model-View-Presenter)**, not MVC:

- **Models** (`models/`) - Data layer with mock data and query functions (e.g., `menuItem.getAll()`)
- **Views** (`views/`) - Express route handlers (e.g., `menuRoutes.js`)
- **Presenters** (`presenters/`) - Business logic layer between views and models (e.g., `menuPresenter.js`)

### Pattern Example
```javascript
// View calls Presenter
router.get('/', (req, res) => {
    const result = menuPresenter.getMenu();
    res.status(result.success ? 200 : result.status || 500).json(result);
});

// Presenter calls Model and formats response
const getMenu = () => {
    try {
        return { success: true, data: menuItemModel.getAll() };
    } catch (err) {
        return { success: false, message: 'Internal server error' };
    }
};
```

**Never bypass the Presenter layer** - always route requests through Views → Presenters → Models.

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
# Terminal 1 - Backend
cd backend; npm install; npm start

# Terminal 2 - Frontend  
cd frontend; npm install; npm run dev

# Terminal 3 - AI Agent (after backend is up)
cd AIVoiceAgent; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python main.py --room my-agent-room
```

### Environment Variables Required
- **Backend**: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `PORT` (default 5000)
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

## Critical Files
- `backend/app.js` - Express app setup, LiveKit token endpoint
- `frontend/src/hooks/useLiveKit.js` - Complete LiveKit integration logic
- `AIVoiceAgent/main.py` - Agent entrypoint with backend health check
- `AIVoiceAgent/agents/voice_agent.py` - Agent class with Gemini Realtime model
- `backend/utils/config.js` - Environment variable loading

## Common Pitfalls
- Don't use MVC terminology - it's MVP (Presenter, not Controller)
- Always check backend health before starting agent (`main.py` does this)
- Audio issues? Frontend needs user interaction to play audio (browser autoplay policies)
- Agent tools must return strings, not raw response objects
