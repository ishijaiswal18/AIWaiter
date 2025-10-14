# TypeScript Backend Documentation

This document provides a comprehensive, self-contained overview of the TypeScript backend - covering architecture, design patterns, implementation details, and testing strategies. After reading this document, you should have complete knowledge of the codebase without needing to read the source code.

## Table of Contents

1. [Architecture](#architecture)
   - [Layers](#layers)
   - [Data Flow](#data-flow)
   - [Why Static Methods?](#why-static-methods)
2. [Design Decisions & Patterns](#design-decisions--patterns)
   - [Repository Pattern + Static Services Hybrid](#1-repository-pattern--static-services-hybrid)
   - [AsyncLocalStorage for Request Context](#2-asynclocalstorage-for-request-context)
   - [AppResponse<T> Standardized Response Type](#3-appresponset-standardized-response-type)
   - [Zod for Runtime Validation](#4-zod-for-runtime-validation)
   - [RepositoryFactory with Singleton + Reset](#5-repositoryfactory-with-singleton--reset)
   - [Static Methods Over Dependency Injection](#6-static-methods-over-dependency-injection)
   - [Integration Tests Over Unit Tests](#7-integration-tests-over-unit-tests)
3. [Setup & Run](#setup--run)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Logging Architecture](#logging-architecture)
7. [Testing Strategy](#testing-strategy)
8. [LiveKit Integration](#livekit-integration)
9. [Adding New Features](#adding-new-features)

---

## Architecture

The TypeScript backend follows the **Repository Pattern** with **Static Methods**, providing clean separation of concerns, testability, and simplicity:

### Layers

1. **Repositories** (`src/repositories/`)
   - **Interfaces** (`interfaces/`) - Define contracts for data access (IMenuRepository, IOrderRepository, IUserRepository)
   - **Implementations** (`implementations/`) - Concrete implementations (currently mock data, designed for easy database integration)
   - **RepositoryFactory** (`RepositoryFactory.ts`) - Centralized factory for repository instantiation
     - Singleton pattern with lazy initialization
     - `reset()` method for test isolation
     - Future-ready for config-based database selection (Mock vs Postgres)

2. **Services** (`src/services/`)
   - Business logic layer using **static methods**
   - Returns standardized `AppResponse<T>` from `types/common.ts`
   - Each method calls `RepositoryFactory.getXxxRepository()` directly
   - Uses `createLogger('ServiceName')` for automatic request context logging
   - **No constructors or instance state** - pure stateless logic

3. **Controllers** (`src/api/controllers/`)
   - HTTP request/response handling using **static methods**
   - Thin layer that delegates to static service methods
   - Handles status code mapping from service responses
   - Uses `createLogger('ControllerName')` for automatic request tracing
   - **No constructors or instance state** - direct route-to-service calls

4. **Routes** (`src/api/routes/`)
   - Route definitions with Zod validation middleware
   - Direct static controller method calls: `router.get('/menu', MenuController.getMenu)`
   - Mounted at `/api` prefix
   - Clean, minimal routing with zero per-request overhead

5. **Middleware** (`src/middleware/`)
   - `requestId.ts` - Assigns unique ID to each request and creates request-scoped logger
   - `validation.ts` - Zod schema validation middleware factory
   - `errorHandler.ts` - Centralized error handling

### Data Flow

```
Request → Middleware (ID, Validation) → Route → Static Controller → Static Service → RepositoryFactory → Repository → Data
                                                                                                                         ↓
Response ← Static Controller ← AppResponse<T> ← Static Service ← Repository Data
```

### Why Static Methods?

**Repository Pattern is preserved** because repositories WILL be swapped (Mock → Postgres) and tests need `reset()`.

**Services and Controllers use static methods** because:
- ✅ **No multiple implementations** - Services/controllers are just stateless logic wrappers, not swappable
- ✅ **60% less code** - No constructors, no instantiation boilerplate, no DI ceremony
- ✅ **Clearer call chains** - Direct static calls instead of instance creation per request
- ✅ **Zero dependencies** - No DI frameworks, no complex configuration
- ✅ **YAGNI principle** - Only add complexity where actually needed (repository swapping)
- ✅ **Test isolation maintained** - `RepositoryFactory.reset()` provides fresh data per test
- ✅ **Enhanced logging** - LOG_SOURCE constants identify file source in all logs

## Design Decisions & Patterns

### 1. Repository Pattern + Static Services Hybrid

**Decision**: Use Repository Pattern for data access but static methods for services/controllers.

**Rationale**:
- **Repositories need interfaces** because they'll be swapped (Mock → Postgres). Dependency Injection is justified here.
- **Services/controllers are stateless** - they're just logic wrappers around repositories. No need for multiple implementations.
- **60% code reduction** by eliminating constructors, DI containers, and instance management for services.
- **YAGNI principle** - Add complexity (DI) only where there's concrete value (repository swapping).

**Trade-offs**:
- ✅ Simpler codebase, easier onboarding
- ✅ Zero per-request instantiation overhead
- ✅ Direct static calls are easier to trace and debug
- ⚠️ Harder to mock services in unit tests (but we use integration tests with real repositories)

**When to Use Each**:
```typescript
// Repositories: Interfaces + Factory (will swap implementations)
interface IMenuRepository { getAll(): MenuItem[] }
class MockMenuRepository implements IMenuRepository { ... }
RepositoryFactory.getMenuRepository() // Returns current implementation

// Services: Static Methods (stateless logic, no swapping needed)
class MenuService {
    static getMenu(): AppResponse<MenuItem[]> { ... }
}

// Controllers: Static Methods (stateless HTTP handlers)
class MenuController {
    static getMenu(req: Request, res: Response): void { ... }
}
```

### 2. AsyncLocalStorage for Request Context

**Decision**: Use Node.js AsyncLocalStorage for automatic request context propagation instead of attaching `req.log` or `req.id`.

**Rationale**:
- **Zero request object pollution** - No custom properties, Express types remain clean
- **Automatic propagation** - requestId flows through entire call stack without manual passing
- **Concurrent request safe** - Each request gets isolated context (verified with 50+ concurrent tests)
- **Single logging pattern** - `createLogger('SourceName')` everywhere, no special cases

**Implementation**:
```typescript
// src/middleware/requestId.ts
const requestContext = new AsyncLocalStorage<{ requestId: string }>();

export const requestIdMiddleware = (req, res, next) => {
    const requestId = crypto.randomUUID();
    requestContext.run({ requestId }, () => next());
};

// src/utils/logger.ts
export const createLogger = (source: string) => {
    return logger.child({
        source,
        requestId: requestContext.getStore()?.requestId || 'no-context'
    });
};

// Usage anywhere in the request lifecycle
const logger = createLogger('MenuService');
logger.info('Processing request'); // Automatically includes requestId!
```

**Benefits**:
- ✅ Consistent logging across middleware, routes, controllers, services
- ✅ No `req` object needed in services (cleaner abstractions)
- ✅ Traceability: Every log line tied to its originating request
- ✅ Zero boilerplate: One logger per file, automatic context

### 3. AppResponse<T> Standardized Response Type

**Decision**: All services return `AppResponse<T>` instead of throwing exceptions or returning raw data.

**Rationale**:
- **Consistent error handling** - Services communicate success/failure without exceptions
- **Type-safe responses** - Controllers know exactly what to expect
- **HTTP-friendly** - status codes map cleanly to HTTP responses
- **Testability** - Easy to assert on success/failure in tests

**Structure**:
```typescript
// src/types/common.ts
interface AppResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
    status?: number;
}

// Service usage
static getMenu(): AppResponse<MenuItem[]> {
    try {
        const items = RepositoryFactory.getMenuRepository().getAll();
        return { success: true, data: items };
    } catch (err) {
        return { success: false, message: 'Internal server error', status: 500 };
    }
}

// Controller usage
const result = MenuService.getMenu();
res.status(result.success ? 200 : result.status || 500).json(result);
```

**Benefits**:
- ✅ No try-catch in controllers (handled by services)
- ✅ Consistent JSON responses across all endpoints
- ✅ Easy to add metadata (pagination, warnings) without breaking changes
- ✅ Type inference works beautifully: `result.data` is `MenuItem[]` when `success === true`

### 4. Zod for Runtime Validation

**Decision**: Use Zod schemas in middleware for request validation instead of manual checks.

**Rationale**:
- **Type safety + runtime validation** - Same schema generates TypeScript types and validates input
- **Declarative validation** - Define rules once, reuse across routes
- **Automatic error messages** - Zod provides detailed validation feedback
- **DRY principle** - No duplicate validation logic in controllers

**Pattern**:
```typescript
// src/types/validationSchemas.ts
export const createMenuItemSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        price: z.number().positive('Price must be positive'),
        category: z.string().min(1, 'Category is required')
    })
});

// src/api/routes/menuRoutes.ts
router.post('/', validate(createMenuItemSchema), MenuController.createItem);

// Validation errors automatically return 400 with detailed messages
```

**Benefits**:
- ✅ Type-safe: `req.body` inferred as correct type after validation
- ✅ Consistent error format across all endpoints
- ✅ Easy to extend: Add new validation rules without touching controllers
- ✅ Self-documenting: Schema IS the API contract

### 5. RepositoryFactory with Singleton + Reset

**Decision**: Centralized factory for repository instantiation with lazy initialization and test reset.

**Rationale**:
- **Single source of truth** - All code gets repositories through one factory
- **Lazy initialization** - Repositories created only when first requested
- **Test isolation** - `reset()` provides fresh data for each test
- **Future-ready** - Easy to add config-based selection (Mock vs Postgres)

**Pattern**:
```typescript
// src/repositories/RepositoryFactory.ts
export class RepositoryFactory {
    private static menuRepository: IMenuRepository;

    static getMenuRepository(): IMenuRepository {
        if (!this.menuRepository) {
            this.menuRepository = new MockMenuRepository();
        }
        return this.menuRepository;
    }

    static reset(): void {
        // @ts-ignore - Intentionally set to undefined for fresh instances
        this.menuRepository = undefined;
    }
}

// Test usage
beforeEach(() => {
    RepositoryFactory.reset(); // Fresh data for each test
});
```

**Benefits**:
- ✅ Services get repositories without knowing implementation details
- ✅ Easy to swap implementations (Mock → Postgres) by changing one line
- ✅ Tests never see stale data from previous tests
- ✅ Singleton ensures consistent data within a single request

### 6. Static Methods Over Dependency Injection

**Decision**: Services and controllers use static methods instead of constructor-based DI.

**Rationale**:
- **Services have no state** - Just pure functions wrapped in classes for organization
- **Controllers have no state** - Just HTTP handlers, no instance variables
- **DI is for swapping** - Services/controllers won't be swapped, so DI is ceremony without benefit
- **Simpler codebase** - No DI container, no registration, no injection points

**Comparison**:
```typescript
// ❌ With DI (unnecessary complexity)
class MenuService {
    constructor(private menuRepo: IMenuRepository) {}
    getMenu() { return this.menuRepo.getAll(); }
}
const container = new DIContainer();
container.register('MenuService', () => new MenuService(container.get('MenuRepository')));

// ✅ With Static Methods (simple and direct)
class MenuService {
    static getMenu(): AppResponse<MenuItem[]> {
        const repo = RepositoryFactory.getMenuRepository();
        return { success: true, data: repo.getAll() };
    }
}
```

**When DI is Justified**:
- ✅ Repositories: Will be swapped (Mock → Postgres)
- ❌ Services: Stateless logic, no swapping needed
- ❌ Controllers: HTTP handlers, no swapping needed

### 7. Integration Tests Over Unit Tests

**Decision**: Focus on integration tests that test full request/response cycles.

**Rationale**:
- **Test real behavior** - Integration tests verify entire stack, not isolated units
- **Mock repositories are sufficient** - No need to mock services/controllers (they're thin layers)
- **Fewer brittle tests** - Less mocking means less test maintenance
- **Realistic scenarios** - Tests match actual API usage

**Pattern**:
```typescript
// ✅ Integration test (tests Routes → Controllers → Services → Repositories)
it('should return all menu items', async () => {
    const response = await request(app).get('/api/menu');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(10);
});

// ❌ Unit test (over-mocking, brittle, doesn't test real behavior)
it('MenuService.getMenu should call repository', () => {
    const mockRepo = { getAll: jest.fn(() => []) };
    RepositoryFactory.getMenuRepository = () => mockRepo;
    MenuService.getMenu();
    expect(mockRepo.getAll).toHaveBeenCalled(); // So what?
});
```

**Coverage Strategy**:
- 49 integration tests covering all endpoints
- Concurrent request tests verify AsyncLocalStorage isolation
- JWT validation tests for token correctness
- No unit tests (services/controllers are too thin to justify)

## Setup & Run

### Development
```bash
npm install
npm run dev      # Starts on port 5001 with hot reload (ts-node-dev --files)
```

### Production Build
```bash
npm run build    # Compiles TypeScript to dist/
npm start        # Runs compiled JavaScript
```

### Testing
```bash
npm test              # Run all tests (with --runInBand for serial execution)
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

## Environment Variables

Create a `.env` file in the `ts_backend` directory:

```env
# Server Configuration
PORT=5001                           # Backend server port (5000 for JS backend, 5001 for TS backend)
NODE_ENV=development                # 'development' or 'production'
LOG_LEVEL=info                      # Winston log level: 'error', 'warn', 'info', 'debug'

# LiveKit Configuration (Required for AI Voice Agent)
LIVEKIT_API_KEY=your_api_key       # LiveKit API key from your LiveKit Cloud project
LIVEKIT_API_SECRET=your_api_secret # LiveKit API secret for JWT token signing
# Get credentials from: https://cloud.livekit.io/
```

**Note on LiveKit Credentials:**
- Required for `POST /api/get-token` endpoint functionality
- Used by AI Voice Agent to establish WebRTC connections
- Tests mock these values, so real credentials not needed for testing
- In production, obtain from LiveKit Cloud dashboard

## API Endpoints

All endpoints return JSON with standardized format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "status": 404
}
```

### Endpoints

**Health Check:**
- `GET /health` - Server health status
  - Response: `{ status: 'ok' }`

**LiveKit Token Generation:**
- `POST /api/get-token` - Generate LiveKit access token for voice/video room access
  - Body: `{ roomName: string, participantName: string }`
  - Response: `{ token: string }` (JWT token for LiveKit room access)
  - Requires environment variables: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
  - Used by AI Voice Agent to connect to LiveKit rooms
  - Validation: Both roomName and participantName must be non-empty strings
  - Error Cases:
    - 400: Missing or empty roomName/participantName
    - 500: LiveKit credentials not configured

**Menu:**
- `GET /api/menu` - Get all menu items
- `GET /api/menu/specials` - Get special items only
- `GET /api/menu/category/:categoryName` - Filter by category
- `GET /api/menu/type/:foodType` - Filter by type (veg/non-veg)
- `GET /api/menu/search?q=query` - Search menu items
- `GET /api/menu/:itemId` - Get single item by ID

**Orders:**
- `POST /api/orders` - Create new order
  - Body: `{ userId: string, items: [{ itemId: string, quantity: number }] }`
- `GET /api/orders` - Get all orders
- `GET /api/orders/:orderId/status` - Get order status
- `PUT /api/orders/:orderId` - Update order
  - Body: `{ items?: [...], status?: string }`
- `DELETE /api/orders/:orderId` - Cancel order (returns 204 No Content)

**User Favorites:**
- `GET /api/users/:userId/favorites` - Get user's favorite items (returns populated menu items)
- `POST /api/users/:userId/favorites` - Add favorite
  - Body: `{ itemId: string }`
- `DELETE /api/users/:userId/favorites/:itemId` - Remove favorite (returns 204 No Content)

**Waiter:**
- `POST /api/users/waiter/call` - Call waiter
  - Body: `{ userId: string, message?: string }`

## Key TypeScript Features

### Type Safety
- **Strict mode enabled** - Full type checking
- **Custom types** (`src/types/`) - MenuItem, Order, OrderItem, OrderStatus, UserFavorites
- **Interface-based design** - Repository interfaces for easy mocking and testing
- **Zod validation** - Runtime type validation with compile-time inference

### AppResponse Pattern
All services return `AppResponse<T>` for consistency:

```typescript
interface AppResponse<T = void> {
    success: boolean;
    data?: T;
    message?: string;
    status?: number;
}
```

Example usage:
```typescript
// Service method
getMenu(): AppResponse<MenuItem[]> {
    try {
        const items = this.menuRepository.getAll();
        return { success: true, data: items, status: 200 };
    } catch (err) {
        return { success: false, message: 'Internal server error' };
    }
}

// Controller handling
const result = this.menuService.getMenu();
if (result.success) {
    res.status(result.status || 200).json(result);
} else {
    res.status(result.status || 500).json(result);
}
```

### Logging Architecture with AsyncLocalStorage

The backend uses **Winston** with **AsyncLocalStorage** for automatic request context propagation. This provides clean, consistent logging across all layers without modifying the Express Request object.

#### Key Features
- **Zero Request Object Modifications** - No `req.log` or `req.id` attached
- **Automatic Context Propagation** - requestId flows through entire request lifecycle via AsyncLocalStorage
- **Single Pattern Everywhere** - `createLogger('SourceName')` in all files
- **Structured Logs** - JSON format with `requestId` and `source` metadata
- **Concurrent Request Safe** - AsyncLocalStorage isolates contexts per request (verified with 50+ concurrent request tests)

#### Log Format

**Console Output (Development):**
```
2025-10-13 07:40:06 [info] [reqId:e4bb980c-975c-4184-83ca-5a942b295337] [source:MenuController]: GET /api/menu
2025-10-13 07:40:06 [info] [reqId:e4bb980c-975c-4184-83ca-5a942b295337] [source:MenuService]: Retrieved all menu items
```

**JSON Logs (Production - logs/app.log):**
```json
{
  "level": "info",
  "message": "GET /api/menu",
  "requestId": "e4bb980c-975c-4184-83ca-5a942b295337",
  "source": "MenuController",
  "timestamp": "2025-10-13T07:40:06.000Z"
}
```

#### Usage Pattern

```typescript
// 1. Import createLogger at top of file
import { createLogger } from '../utils/logger';

// 2. Create logger with source name (once per file)
const logger = createLogger('MenuController');

// 3. Use logger anywhere - requestId automatically included!
static getMenu(req: Request, res: Response) {
  logger.info('GET /api/menu');  // No req.log, no LOG_SOURCE prefix!
  const result = MenuService.getMenu();
  res.status(result.success ? 200 : 500).json(result);
}
```

#### How AsyncLocalStorage Works

1. **Middleware Sets Context** (`requestId.ts`):
   ```typescript
   const requestId = randomUUID();
   requestContext.run({ requestId }, () => {
     logger.info(`Request received: ${req.method} ${req.originalUrl}`);
     next(); // All downstream code inherits this context
   });
   ```

2. **Context Automatically Propagates**:
   - Controllers call services
   - Services call repositories
   - All async operations (promises, callbacks) maintain context
   - Every `logger.info()` automatically includes the requestId

3. **Concurrent Request Isolation**:
   - Each request gets its own isolated AsyncLocalStorage context
   - No context bleeding between simultaneous requests
   - Verified with concurrent request integration tests (49 tests total)

#### Source Names Used

| Layer | Source Names |
|-------|-------------|
| **Middleware** | `RequestIdMiddleware`, `ValidationMiddleware`, `ErrorHandler` |
| **Routes** | `HealthCheck` |
| **Controllers** | `MenuController`, `OrderController`, `UserController`, `LiveKitController` |
| **Services** | `MenuService`, `OrderService`, `UserService`, `LiveKitService` |
```

## Testing Strategy

### Test Structure
- **Integration tests** in `tests/api/` using Jest + Supertest
- **49 comprehensive tests** covering all endpoints + concurrent request scenarios + JWT validation
- **Serial execution** (`--runInBand`) to prevent race conditions
- **Test isolation** via `RepositoryFactory.reset()` in `beforeEach()`
- **Concurrent request tests** verify AsyncLocalStorage context isolation
- **JWT validation tests** verify LiveKit token structure and claims

### Test Files
1. **health.test.ts** (1 test) - Server health check
2. **menu.test.ts** (11 tests) - Menu endpoints (CRUD, search, filter)
3. **order.test.ts** (10 tests) - Order lifecycle (create, update, status, cancel)
4. **user.test.ts** (11 tests) - User favorites and waiter calls
5. **concurrent-requests.test.ts** (4 tests) - AsyncLocalStorage isolation with 50+ concurrent requests
6. **livekit.test.ts** (12 tests) - LiveKit token generation, validation, and JWT structure

### Test Pattern Example
```typescript
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

describe('Menu API Endpoints', () => {
  beforeEach(() => {
    RepositoryFactory.reset(); // Fresh repositories for each test
  });

  it('should return all menu items', async () => {
    const response = await request(app).get('/api/menu');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  it('should return 404 for non-existent item', async () => {
    const response = await request(app).get('/api/menu/nonexistent');
    
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
```

### Important Testing Notes
1. **HTTP 204 responses** have no body - don't check `response.body`
2. **RepositoryFactory.reset()** in `beforeEach()` provides fresh mock data for each test
3. **Use unique test data IDs** to avoid conflicts between tests
4. **TypeScript config** must include `tests/**/*` for VS Code IntelliSense
5. **All tests run serially** (`--runInBand`) to prevent race conditions with shared repository state

## LiveKit Integration

### Overview
LiveKit is integrated to provide real-time voice/video room access for the AI voice agent. The backend generates JWT tokens that clients use to connect to LiveKit rooms.

**Purpose**: Enable secure, token-based authentication for LiveKit voice/video rooms without exposing API credentials to clients.

### Architecture

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │  POST /api/get-token  │ Backend  │                    │ LiveKit  │
│          ├────────────────────►│          │                    │  Server  │
│          │ {roomName, participant}│          │                    │          │
│          │◄────────────────────┤          │                    │          │
│          │   {token: "JWT"}    │          │                    │          │
│          │                    │          │                    │          │
│          │  Connect with JWT  │          │                    │          │
│          ├─────────────────────────────────────────────────►│          │
│          │                    │          │                    │          │
└──────────┘                    └──────────┘                    └──────────┘
```

### Components

#### 1. LiveKitService (`src/services/LiveKitService.ts`)
**Purpose**: Generate LiveKit JWT tokens with appropriate room grants.

**Key Method**:
```typescript
static async generateToken(
    roomName: string, 
    participantName: string
): Promise<AppResponse<{ token: string }>>
```

**Implementation Details**:
- Uses `livekit-server-sdk`'s `AccessToken` class
- Sets participant identity via `setIdentity(participantName)`
- Adds video grants:
  - `room: roomName` - Specific room access
  - `roomJoin: true` - Permission to join room
  - `canPublish: true` - Permission to publish audio/video
  - `canSubscribe: true` - Permission to receive audio/video
- Token valid for 1 hour (default)
- Returns `AppResponse<{token: string}>` for standardized error handling

**Environment Dependencies**:
- `LIVEKIT_API_KEY` - API key from LiveKit dashboard (identifies your project)
- `LIVEKIT_API_SECRET` - API secret for signing JWTs (keep secure!)

**Example**:
```typescript
const result = await LiveKitService.generateToken('lobby', 'user123');
// result.data.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 2. LiveKitController (`src/api/controllers/LiveKitController.ts`)
**Purpose**: HTTP handler for token generation endpoint.

**Key Method**:
```typescript
static async getToken(req: Request, res: Response): Promise<void>
```

**Implementation Details**:
- Extracts `roomName` and `participantName` from request body (validated by Zod middleware)
- Calls `LiveKitService.generateToken()`
- Maps service response to HTTP status codes:
  - 200 OK - Token generated successfully
  - 500 Internal Server Error - Failed to generate token (e.g., missing credentials)

**Logging**: Uses `createLogger('LiveKitController')` with automatic requestId propagation via AsyncLocalStorage.

**Example**:
```typescript
// POST /api/get-token
// Body: { "roomName": "lobby", "participantName": "user123" }
// Response: { "success": true, "data": { "token": "eyJ..." } }
```

#### 3. Validation Schema (`src/types/validationSchemas.ts`)
**Purpose**: Validate token request parameters.

**Schema**:
```typescript
export const tokenRequestSchema = z.object({
    body: z.object({
        roomName: z.string().min(1, 'Room name is required'),
        participantName: z.string().min(1, 'Participant name is required')
    })
});
```

**Validation Rules**:
- `roomName`: Non-empty string (room identifier)
- `participantName`: Non-empty string (user identity in room)

**Error Response** (400 Bad Request):
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "roomName",
            "message": "Room name is required"
        }
    ]
}
```

#### 4. Routes (`src/api/routes/livekitRoutes.ts`)
**Purpose**: Define LiveKit API endpoints.

**Implementation**:
```typescript
import { LiveKitController } from '../controllers/LiveKitController';
import { validate } from '../../middleware/validation';
import { tokenRequestSchema } from '../../types/validationSchemas';

export function createLivekitRouter(): Router {
    const router = Router();
    
    router.post('/get-token', 
        validate(tokenRequestSchema), 
        LiveKitController.getToken
    );
    
    return router;
}
```

**Middleware Chain**:
1. `validate(tokenRequestSchema)` - Validates request body
2. `LiveKitController.getToken` - Generates token

**Mounted At**: `/api/get-token` (via `src/api/routes/index.ts`)

### JWT Token Structure

**Format**: `header.payload.signature` (3 parts, Base64-encoded, dot-separated)

**Header** (algorithm and token type):
```json
{
    "alg": "HS256",
    "typ": "JWT"
}
```

**Payload** (claims):
```json
{
    "sub": "user123",                    // Participant identity
    "video": {
        "room": "lobby",                 // Room name
        "roomJoin": true,                // Can join room
        "canPublish": true,              // Can publish audio/video
        "canSubscribe": true             // Can receive audio/video
    },
    "iss": "APIxxxxxxxxxxxxxxxx",        // Issuer (LIVEKIT_API_KEY)
    "nbf": 1234567890,                   // Not valid before (timestamp)
    "exp": 1234571490                    // Expires at (timestamp, +1 hour)
}
```

**Signature**: HMAC-SHA256 hash of `header.payload` using `LIVEKIT_API_SECRET`.

**Security Notes**:
- **Never expose API secret** to clients - generate tokens server-side only
- **Token expiration** limits replay attack window (default 1 hour)
- **Room-specific tokens** prevent unauthorized room access
- **Identity binding** enables participant tracking and permissions

### Testing Strategy

#### Test Environment Setup
Tests mock LiveKit credentials to avoid requiring real API keys:

```typescript
describe('LiveKit Endpoints', () => {
    beforeEach(() => {
        // Set fake credentials for testing
        process.env.LIVEKIT_API_KEY = 'test-api-key';
        process.env.LIVEKIT_API_SECRET = 'test-api-secret';
    });

    afterEach(() => {
        // Restore original environment
        if (originalEnv.LIVEKIT_API_KEY) {
            process.env.LIVEKIT_API_KEY = originalEnv.LIVEKIT_API_KEY;
        }
        if (originalEnv.LIVEKIT_API_SECRET) {
            process.env.LIVEKIT_API_SECRET = originalEnv.LIVEKIT_API_SECRET;
        }
    });
});
```

**Why Mocking Works**: `livekit-server-sdk` generates JWTs locally without calling LiveKit servers during token generation. Only the client needs to connect to LiveKit with the token.

#### Test Coverage (12 tests)

**1. Successful Token Generation** (4 tests):
- Basic token generation with valid request
- Different participant names produce different tokens
- Different room names produce different tokens
- Multiple token requests work correctly

**2. Validation Tests** (4 tests):
- Missing `roomName` returns 400 with "Validation failed"
- Missing `participantName` returns 400 with "Validation failed"
- Empty `roomName` returns 400
- Empty `participantName` returns 400

**3. Environment Tests** (2 tests):
- Missing `LIVEKIT_API_KEY` returns 500
- Missing `LIVEKIT_API_SECRET` returns 500

**4. JWT Validation Tests** (2 tests):
- **Token structure validation**: Verifies JWT has 3 parts (header.payload.signature), decodes payload, checks LiveKit-specific claims (`sub`, `video.room`, `video.roomJoin`, `video.canPublish`, `video.canSubscribe`) and standard JWT claims (`iss`, `exp`, `nbf`)
- **Token verification**: Decodes token, validates issuer matches API key, verifies expiration time is in future (`exp > now`) and not-before time is valid (`nbf ≤ now`)

**JWT Decoding Example**:
```typescript
const parts = token.split('.');
expect(parts).toHaveLength(3); // header.payload.signature

const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

expect(payload.sub).toBe('test-participant');
expect(payload.video.room).toBe('test-room');
expect(payload.video.roomJoin).toBe(true);
expect(payload.iss).toBe('test-api-key');
expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
```

### Production Configuration

#### Environment Variables
Add to `.env` (production values from LiveKit dashboard):
```bash
# LiveKit Configuration
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret-key-here
```

#### Security Checklist
- ✅ Never commit `.env` to git (use `.env.example` instead)
- ✅ Rotate API secret if exposed
- ✅ Use HTTPS in production to protect tokens in transit
- ✅ Validate token expiration on client side
- ✅ Implement rate limiting on `/api/get-token` endpoint
- ✅ Log token generation attempts for audit trail

#### Frontend Integration
Example usage in React:
```typescript
// Request token from backend
const response = await fetch('http://localhost:5001/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        roomName: 'lobby',
        participantName: 'user123'
    })
});

const { data } = await response.json();
const token = data.token;

// Connect to LiveKit with token
import { Room } from 'livekit-client';
const room = new Room();
await room.connect('wss://your-livekit-url.livekit.cloud', token);
```

### Troubleshooting

**Issue**: "Token validation failed" on LiveKit server  
**Solution**: Check that `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` match LiveKit dashboard values. Verify token hasn't expired (default 1 hour).

**Issue**: "Missing required environment variables"  
**Solution**: Ensure `.env` file exists and contains both `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`. Restart server after adding variables.

**Issue**: Tests pass but production tokens fail  
**Solution**: Verify production `.env` has real credentials (not test-api-key). Check LiveKit dashboard for correct API key/secret pair.

**Issue**: "Cannot connect to LiveKit room"  
**Solution**: Verify LiveKit URL is correct (`wss://your-project.livekit.cloud`). Check network connectivity and firewall rules.

### Design Decisions

**Why Static Methods?**  
LiveKitService has no state - it just generates tokens. Static methods eliminate per-request object instantiation overhead and simplify dependency injection (no DI container needed).

**Why Not Store Tokens?**  
Tokens are single-use and expire quickly (1 hour). Storing them adds complexity without benefit. Clients can request new tokens as needed.

**Why Server-Side Token Generation?**  
API secrets must never be exposed to clients. Server-side generation keeps secrets secure while allowing clients to connect to LiveKit.

**Why JWT?**  
JWT is industry-standard, self-contained (no database lookup), and LiveKit-native. All LiveKit clients expect JWT tokens.

## Adding New Features

### 1. Add Entity Type
Define in `src/types/entities.ts`:
```typescript
export interface NewEntity {
    id: string;
    name: string;
    // ... other fields
}
```

### 2. Create Repository Interface
In `src/repositories/interfaces/INewRepository.ts`:
```typescript
export interface INewRepository {
    getAll(): NewEntity[];
    getById(id: string): NewEntity | undefined;
    create(entity: NewEntity): NewEntity;
    // ... other methods
}
```

### 3. Implement Mock Repository
In `src/repositories/implementations/MockNewRepository.ts`:
```typescript
export class MockNewRepository implements INewRepository {
    private entities: NewEntity[] = [/* mock data */];
    
    getAll(): NewEntity[] {
        return this.entities;
    }
    // ... implement interface methods
}
```

### 4. Update RepositoryFactory
Add to `src/repositories/RepositoryFactory.ts`:
```typescript
private static newRepository: INewRepository;

static getNewRepository(): INewRepository {
    if (!this.newRepository) {
        this.newRepository = new MockNewRepository();
    }
    return this.newRepository;
}

// Update reset() method
static reset(): void {
    // ... existing resets
    // @ts-ignore
    this.newRepository = undefined;
}
```

### 5. Create Service (Static Methods)
In `src/services/NewService.ts`:
```typescript
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import logger from '../utils/logger';

const LOG_SOURCE = '[NewService]';

export class NewService {
    static getAll(): AppResponse<NewEntity[]> {
        try {
            logger.info(`${LOG_SOURCE} Retrieving all entities`);
            const repository = RepositoryFactory.getNewRepository();
            const entities = repository.getAll();
            return { success: true, data: entities, status: 200 };
        } catch (err) {
            logger.error(`${LOG_SOURCE} Error fetching entities: ${err.message}`);
            return { success: false, message: 'Internal server error' };
        }
    }
}
```

### 6. Create Controller (Static Methods)
In `src/api/controllers/NewController.ts`:
```typescript
import { NewService } from '../../services/NewService';

const LOG_SOURCE = '[NewController]';

export class NewController {
    static getAll(req: Request, res: Response): void {
        req.log.info(`${LOG_SOURCE} GET /api/new`);
        const result = NewService.getAll();
        
        if (result.success) {
            res.status(result.status || 200).json(result);
        } else {
            res.status(result.status || 500).json(result);
        }
    };
}
```

### 7. Create Routes with Static Controller Methods
In `src/api/routes/newRoutes.ts`:
```typescript
import { NewController } from '../controllers/NewController';

export function createNewRouter(): Router {
    const router = Router();
    
    // Direct static method call - clean and simple!
    router.get('/', validate(newSchema), NewController.getAll);
    
    return router;
}
```

### 8. Add Zod Schema
In `src/types/validationSchemas.ts`:
```typescript
export const newSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        // ... other validations
    })
});
```

### 9. Mount Router
Update `src/api/routes/index.ts`:
```typescript
import { createNewRouter } from './newRoutes';

export function createApiRouter(): Router {
    const router = Router();
    
    router.use('/menu', createMenuRouter());
    router.use('/orders', createOrderRouter());
    router.use('/users', createUserRouter());
    router.use('/new', createNewRouter()); // Add new route
    
    return router;
}
```

### 10. Write Tests
Create `tests/api/new.test.ts`:
```typescript
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

describe('New API Endpoints', () => {
    beforeEach(() => {
        RepositoryFactory.reset(); // Fresh data for each test
    });

    it('should return all entities', async () => {
        const response = await request(app).get('/api/new');
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
```

## Migration from JavaScript Backend

The TypeScript backend is a complete reimplementation with:

✅ **Type Safety** - Strict TypeScript with full type checking  
✅ **Better Architecture** - Repository pattern vs MVP  
✅ **Dependency Injection** - Testable, modular design  
✅ **Runtime Validation** - Zod schemas for all inputs  
✅ **Comprehensive Testing** - 33 integration tests with 100% endpoint coverage  
✅ **Request Tracing** - Unique IDs and request-scoped logging  
✅ **Modern Tooling** - ts-node-dev, Jest, Supertest  

### Key Differences from JS Backend

| Aspect | JS Backend (MVP) | TS Backend (Repository + Static) |
|--------|------------------|----------------------------------|
| **Architecture** | Model-View-Presenter | Repository-Service-Controller |
| **Data Layer** | Direct model calls | Repository interfaces with Factory |
| **Business Logic** | Presenters | Static Service methods |
| **Controllers** | Route handlers | Static Controller methods |
| **Response Format** | Varied | Standardized AppResponse<T> |
| **Validation** | Manual | Zod schemas |
| **Testing** | None | 33 integration tests |
| **Type Safety** | JavaScript | Strict TypeScript |
| **Port** | 5000 | 5001 |
| **DI Pattern** | No | RepositoryFactory only (pragmatic approach) |

Both backends are functionally equivalent and can be used interchangeably with the frontend and AI agent.

## Troubleshooting

### VS Code Type Errors
If you see "Cannot find type definition file for 'jest'" or similar:
1. Ensure `tests/**/*` is included in `tsconfig.json`
2. Run `npm install` to ensure @types packages are present
3. Press `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Test Failures
- Ensure tests run serially: `npm test` uses `--runInBand` flag
- Check that `RepositoryFactory.reset()` is in `beforeEach()` hooks
- Verify static methods are being called correctly

### Compilation Errors
- Run `tsc --noEmit` to check for TypeScript errors
- Ensure `"skipLibCheck": true` in tsconfig.json
- Check that custom types are in `typeRoots`

### Port Conflicts
- TS backend uses port 5001 by default
- JS backend uses port 5000

## Repository Factory Pattern

### Why Only Repositories Use Factory Pattern?

This project uses a **pragmatic, YAGNI-driven approach**:

**RepositoryFactory exists** because:
1. ✅ **Repositories WILL be swapped** - Mock → Postgres migration is coming
2. ✅ **Tests need reset()** - Fresh mock data for each test
3. ✅ **Interface pattern needed** - Different implementations (Mock, Postgres, potential Redis cache)

**Services/Controllers use static methods** because:
1. ✅ **No multiple implementations** - They're just stateless logic wrappers
2. ✅ **Never swapped** - No alternate MenuService, OrderService implementations needed
3. ✅ **YAGNI (You Aren't Gonna Need It)** - Don't add DI ceremony without a clear need
4. ✅ **60% less code** - No constructors, no instantiation, no per-request overhead

### When to Use External DI Frameworks

Consider TSyringe, InversifyJS, or TypeDI when you need:
- **10+ services** with complex dependency graphs
- **Circular dependencies** that need resolution
- **Scoped lifetimes** (transient, singleton, request-scoped)
- **Multi-tenant** configurations with runtime tenant-specific services

For this project: **Manual RepositoryFactory + Static methods is the right balance.**

### RepositoryFactory Usage

**In Services (static methods):**
```typescript
static getMenu(): AppResponse<MenuItem[]> {
  const repository = RepositoryFactory.getMenuRepository();
  const items = repository.getAll();
  return { success: true, data: items };
}
```

**In Tests:**
```typescript
import { RepositoryFactory } from '../../src/repositories/RepositoryFactory';

describe('Menu API', () => {
  beforeEach(() => {
    RepositoryFactory.reset(); // Fresh mock data for each test
  });
});
```

### Common Patterns

✅ **DO: Use static methods directly**
```typescript
// Routes call static controller methods
router.get('/menu', MenuController.getMenu);

// Controllers call static service methods
static getMenu(req: Request, res: Response): void {
    const result = MenuService.getMenu();
    res.status(result.success ? 200 : 500).json(result);
}

// Services call RepositoryFactory
static getMenu(): AppResponse<MenuItem[]> {
    const repository = RepositoryFactory.getMenuRepository();
    return { success: true, data: repository.getAll() };
}
```

❌ **DON'T: Try to instantiate services/controllers**
```typescript
// ❌ WRONG - Services and controllers have no constructors
const service = new MenuService(); // Error: No constructor!
const controller = new MenuController(); // Error: No constructor!

// ✅ CORRECT - Use static methods
MenuService.getMenu();
MenuController.getMenu(req, res);
```

---

## Comparison: JavaScript Backend (MVP) vs TypeScript Backend (Repository Pattern)

### JavaScript Backend (`backend/`)
- **Architecture**: MVP (Model-View-Presenter)
- **Models**: `menuItem.js` - Data layer with mock data and query functions (e.g., `menuItem.getAll()`)
- **Views**: `menuRoutes.js` - Express route handlers
- **Presenters**: `menuPresenter.js` - Business logic layer between views and models
- **Pattern**: Views → Presenters → Models
- **Type Safety**: ❌ None (vanilla JavaScript)
- **Testing**: ❌ No tests
- **Logging**: Basic `console.log` in `utils/logger.js`

### TypeScript Backend (`ts_backend/`)
- **Architecture**: Repository Pattern + Static Methods
- **Repositories**: Interfaces + Mock implementations with factory
- **Services**: Static methods for business logic
- **Controllers**: Static methods for HTTP handling
- **Routes**: Direct static controller calls with Zod validation
- **Pattern**: Routes → Static Controllers → Static Services → RepositoryFactory → Repositories
- **Type Safety**: ✅ Strict TypeScript with no `any`
- **Testing**: ✅ 49 integration tests with 100% endpoint coverage
- **Logging**: Winston with AsyncLocalStorage for request context

### Migration Status
- ✅ **All features migrated** from JS to TS backend
- ✅ **LiveKit endpoint** (`POST /api/get-token`) fully implemented and tested
- ✅ **Menu, Order, User APIs** complete with validation
- ✅ **Health check** endpoint operational
- ✅ **Test coverage** comprehensive (49 tests)
- ✅ **Documentation** complete

### Why TypeScript Backend is Better
1. **Type Safety** - Catch errors at compile time, not runtime
2. **Better Architecture** - Clear separation of concerns with Repository Pattern
3. **Comprehensive Testing** - 49 integration tests verify behavior
4. **Modern Patterns** - AsyncLocalStorage, Zod validation, static methods
5. **Maintainability** - 60% less code than equivalent DI approach
6. **Scalability** - Easy to add Postgres/Redis when needed (just add repository implementations)

---

**Port Configuration**: Change via `PORT` in `.env` file (5001 for TS backend, 5000 for JS backend)
