## AIWaiter — Copilot instructions (concise)

Purpose: give AI coding agents a short, actionable reference for this repository: architecture, conventions, critical commands, and key files.

Product overview: We are building a restaurant management application (AIWaiter) that manages inventory, staff, billing, orders, and table/dine-in workflows. A central feature is an AI voice assistant (the "waiter") that can talk to customers, take orders, suggest dishes, and interact with the frontend via LiveKit; the rest of the system provides APIs for inventory, billing, and staff management.

Developer persona & supported flows
  - Primary goal: help developers understand how the AI waiter should behave so features, tools, and prompts align with product needs.
  - Core user flows for the agent (implement these first):
    1. Greet & onboard: brief greeting, ask number of guests, dietary preferences, and seating choice.
    2. Menu discovery & suggestion: suggest categories, recommend specials based on `isSpecial` and user preferences, and answer ingredient/allergy questions.
    3. Order creation: add/remove items, confirm quantities, compute totals, and send order to backend (`POST /api/orders` or JS backend `/orders`).
    4. Order status & updates: check kitchen status and notify frontend (cart updates / order tracking).
    5. Billing & split checks: compute bill, apply taxes/discounts, support splitting among guests, and call billing APIs.
    6. Staff handoff & exceptions: escalate to human staff for complex requests (refunds, inventory issues, out-of-stock).

Reference → Implementation TODO templates
  - Purpose: concrete, copy-pasteable TODO templates for adapting patterns from `reference_codebase/` into this repo. Use branches and tests as required.

  Template: Port LiveKit token generator
  - Reference file: `reference_codebase/.../livekit_token_example.ts` (example)
  - Target: `ts_backend/src/services/LiveKitService.ts`
  - Tasks:
    - [ ] Create `LiveKitService.generateToken(roomName, participantName)` using `livekit-server-sdk` AccessToken.
    - [ ] Add Zod schema in `ts_backend/src/types/validationSchemas.ts` and route `ts_backend/src/api/routes/livekitRoutes.ts`.
    - [ ] Add controller `ts_backend/src/api/controllers/LiveKitController.ts` that calls the service.
    - [ ] Add tests in `ts_backend/tests/api/livekit.test.ts` (mock LIVEKIT creds in `beforeEach()` and assert JWT payload claims).
    - [ ] Run `cd ts_backend && npm test` and fix failures.

  Template: Add an agent tool for `get_specials`
  - Reference file: `reference_codebase/.../agent_tools_examples.py`
  - Target: `AIVoiceAgent/tools/tools.py`
  - Tasks:
    - [ ] Implement `@function_tool()` async `get_specials()` that calls TS backend `/api/menu?filter=specials`.
    - [ ] Register the tool in `AIVoiceAgent/agents/voice_agent.py` and document JSON input/output.
    - [ ] Add unit tests or a small runner `AIVoiceAgent/tests/test_tools.py` (mock HTTP responses).

  Template: Frontend LiveKit hook example
  - Reference file: `reference_codebase/.../frontend_livekit_hook.js`
  - Target: `frontend/src/hooks/useLiveKit.js`
  - Tasks:
    - [ ] Compare reference to current `useLiveKit.js`; copy missing features (data message handling for `command` type) into a new branch.
    - [ ] Add or update frontend tests or a local smoke page to verify data messages trigger navigation/cart updates.

  Copying rules (reminder)
    - Keep license and attribution where present.
    - Prefer re-implementation to match repository patterns (MVP for JS backend, RepositoryFactory for TS backend).
    - Add tests and use `RepositoryFactory.reset()` when needed.

If you'd like, pick one template above and I will implement it now (create service + controller + tests for LiveKit token OR implement the `get_specials` tool in the agent). Which one should I do first?

1) High-level architecture
  - `backend/` (JS, MVP): Views → Presenters → Models. Example: `backend/views/menuRoutes.js` calls `backend/presenters/menuPresenter.js`.
  - `ts_backend/` (TS, Repository pattern): Routes → Static Controllers → Static Services → `RepositoryFactory` → Repositories.
  - `frontend/` (React + Vite): LiveKit integration in `frontend/src/hooks/useLiveKit.js`; cart in `frontend/src/context/CartContext.jsx`.
  - `AIVoiceAgent/` (Python): agent entry `main.py`, tools in `AIVoiceAgent/tools/tools.py`, prompts in `AIVoiceAgent/prompts/prompts.py`.

2) Critical conventions (do this, not that)
  - JS backend: always route through Presenters (Views → Presenters → Models). Don't call models from routes.
  - TS backend: always get repositories via `RepositoryFactory`. Services/controllers are stateless static methods.
  - TS logging: use `createLogger('Source')` (requestId comes from AsyncLocalStorage) — see `ts_backend/src/utils/logger.ts`.
  - API responses follow `AppResponse<T>` / `{ success, data?, message?, status? }` (see `ts_backend/src/types/common.ts`).

3) Dev & test commands (from repo root)
  - JS backend: cd backend && npm install && npm start  (port 5000)
  - TS backend: cd ts_backend && npm install && npm run dev (port 5001)
  - Frontend: cd frontend && npm install && npm run dev
  - Agent: cd AIVoiceAgent && python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt && python main.py --room my-agent-room
  - TS tests: cd ts_backend && npm test  (tests run serially; repo config uses `--runInBand`)

4) LiveKit notes
  - TS token endpoint: POST `/api/get-token` (ts_backend). JS token endpoint: POST `/get-token` (backend).
  - Tests mock `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` in `beforeEach()`; no real LiveKit needed for unit tests.

5) Agent tooling
  - Add a new tool: implement async function in `AIVoiceAgent/tools/tools.py` (use `@function_tool()`), then register it in `AIVoiceAgent/agents/voice_agent.py`.
  - Edit prompts/personality in `AIVoiceAgent/prompts/prompts.py`.

6) Tests & safety
  - TS integration tests live under `ts_backend/tests/api/`. Ensure `RepositoryFactory.reset()` is called in `beforeEach()` when altering repository-backed data.
  - Run tests serially to avoid AsyncLocalStorage/requestId leakage (`--runInBand`).

7) Files to check when changing behavior
  - JS backend: `backend/app.js`, `backend/views/*`, `backend/presenters/*`, `backend/models/*`
  - TS backend: `ts_backend/src/app.ts`, `ts_backend/src/api/controllers/*`, `ts_backend/src/services/*`, `ts_backend/src/repositories/*`, `ts_backend/src/utils/logger.ts`
  - Frontend: `frontend/src/hooks/useLiveKit.js`, `frontend/src/context/CartContext.jsx`
  - Agent: `AIVoiceAgent/main.py`, `AIVoiceAgent/agents/voice_agent.py`, `AIVoiceAgent/tools/tools.py`, `AIVoiceAgent/prompts/prompts.py`

8) Quick editing rules for AI agents
  - Prefer small, testable changes. Run TS tests after edits. Preserve public endpoints/response shapes unless asked otherwise.
  - When updating data access, update tests to use `RepositoryFactory.reset()` where needed.

If you want this shortened further or expanded in any area (logging internals, sample tests, LiveKit JWT details, or agent tool examples), tell me which section to expand.

9) `reference_codebase/` (read-only) — how to use it
  - This folder is a reference only. Do NOT modify files inside `reference_codebase/` in this repo. Treat it as read-only documentation.
  - Use it to extract patterns, file layouts, and code examples. Copy/adapt into the appropriate target folders in this repo (`backend/`, `ts_backend/`, `frontend/`, `AIVoiceAgent/`) rather than moving files from `reference_codebase/`.
  - Suggested mapping workflow:
    1. Identify the feature or pattern in `reference_codebase/` (e.g., LiveKit token flow, repoFactory pattern, or agent tool wiring).
    2. Create a small branch and a new folder/file in this repo that implements the pattern (use the same relative paths as targets listed in this file).
    3. Add tests for the new code (follow `ts_backend/tests/api/` patterns). Use `RepositoryFactory.reset()` when using repository-backed mocks.
    4. Run TS tests (`cd ts_backend && npm test`) and frontend smoke run before PR.
  - Mapping examples (reference → target):
    - LiveKit token generator in reference → `ts_backend/src/services/LiveKitService.ts`
    - Agent tool examples in reference → `AIVoiceAgent/tools/tools.py` (implement with `@function_tool()`)
    - Frontend LiveKit hook example in reference → `frontend/src/hooks/useLiveKit.js`
  - Copying rules
    - Keep license, attribution, and comments from reference files where applicable.
    - Prefer re-implementing small pieces to match repo conventions (MVP in JS backend, RepositoryFactory in TS backend) rather than pasting large unrelated modules.
    - If a reference file depends on large external infra, stub/mocks are preferred for initial implementation and tests.
  - Checklist before merging a change inspired by the reference code:
    - [ ] New code implements repo conventions (presenter vs controller, RepositoryFactory, static services).
    - [ ] Tests added/updated and pass locally (`npm test` in `ts_backend`).
    - [ ] `RepositoryFactory.reset()` used in affected tests.
    - [ ] No edits to `reference_codebase/` committed.
    - [ ] PR description references the source path in `reference_codebase/` for reviewer context.
## AIWaiter — Copilot instructions (concise)

Purpose: give AI coding agents a short, actionable reference for this repository: architecture, conventions, critical commands, and important files.
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

## AIWaiter — Copilot instructions (concise)

Purpose: a short, actionable reference for AI coding agents to be productive in this repo.

- High-level architecture (what to know quickly)
  - `backend/` (JS, MVP): Views → Presenters → Models. Example: `backend/views/menuRoutes.js` calls `backend/presenters/menuPresenter.js`.
  - `ts_backend/` (TS, Repository pattern): Routes → Static Controllers → Static Services → `RepositoryFactory` → Repositories. Example: `ts_backend/src/services/LiveKitService.ts`.
  - `frontend/` (React + Vite): LiveKit hook at `frontend/src/hooks/useLiveKit.js`; cart at `frontend/src/context/CartContext.jsx`.
  - `AIVoiceAgent/` (Python): tools in `AIVoiceAgent/tools/tools.py`, prompts in `AIVoiceAgent/prompts/prompts.py`, agent in `AIVoiceAgent/agents/voice_agent.py`.

- Key conventions (do this)
  - JS backend: never bypass presenters from routes.
  - TS backend: use `RepositoryFactory` for repo access and keep services/controllers stateless static methods.
  - Logging (TS): always use `createLogger('Name')` — requestId is supplied via AsyncLocalStorage (`ts_backend/src/utils/logger.ts`).
  - API response shape: `{ success: boolean, data?: T, message?: string, status?: number }` (see `ts_backend/src/types/common.ts`).

- Dev & test commands (from repo root)
  - JS backend: `cd backend && npm install && npm start` (port 5000)
  - TS backend: `cd ts_backend && npm install && npm run dev` (port 5001)
  - Frontend: `cd frontend && npm install && npm run dev`
  - Agent: `cd AIVoiceAgent && python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt && python main.py --room my-agent-room`
  - Run TS tests: `cd ts_backend && npm test` (tests expect serial execution; repo config sets `--runInBand`).

- LiveKit notes
  - TS token endpoint: `POST /api/get-token` (ts_backend). JS token endpoint: `POST /get-token` (backend).
  - Tests commonly mock `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` in `beforeEach()`.

- Quick editing rules for AI agents
  - Make small, testable changes. Update/add tests in `ts_backend/tests/api/` when changing behavior.
  - Preserve public endpoint shapes and response format unless asked otherwise.
  - When changing data access, update `RepositoryFactory.reset()` usage in tests.

Key files to scan when changing behavior: `backend/*`, `ts_backend/src/{app.ts,services,api,repositories}`, `frontend/src/hooks/useLiveKit.js`, `AIVoiceAgent/*`.

If you'd like, I can shorten further, produce a quick checklist for PR reviewers, or expand any section (logging, tests, LiveKit wiring, agent tools).
    token.identity = participantName;
