# TypeScript Backend Documentation

This document provides a comprehensive overview of the TypeScript backend, which is a modern, type-safe reimplementation of the JavaScript backend with improved architecture and testing.

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
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
PORT=5001
```

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

**LiveKit Token:**
- `POST /get-token` - Generate LiveKit access token
  - Body: `{ roomName: string, participantName: string }`

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
   - Verified with concurrent request integration tests (37 tests total)

#### Source Names Used

| Layer | Source Names |
|-------|-------------|
| **Middleware** | `RequestIdMiddleware`, `ValidationMiddleware`, `ErrorHandler` |
| **Routes** | `HealthCheck` |
| **Controllers** | `MenuController`, `OrderController`, `UserController` |
| **Services** | `MenuService`, `OrderService`, `UserService` |
```

## Testing Strategy

### Test Structure
- **Integration tests** in `tests/api/` using Jest + Supertest
- **37 comprehensive tests** covering all endpoints + concurrent request scenarios
- **Serial execution** (`--runInBand`) to prevent race conditions
- **Test isolation** via `RepositoryFactory.reset()` in `beforeEach()`
- **Concurrent request tests** verify AsyncLocalStorage context isolation

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
    RepositoryFactory.reset(); // Fresh mock data
    DIContainer.reset(); // Fresh repositories for each test
  });
});
```

**Available Methods:**
- `DIContainer.createMenuService()` - Create MenuService instance
- `DIContainer.createOrderService()` - Create OrderService instance
- `DIContainer.createUserService()` - Create UserService instance
- `DIContainer.reset()` - Reset all repositories (for testing)

### Common Patterns

✅ **DO: Create services per-request**
```typescript
router.get('/path', (req, res) => {
  const service = DIContainer.createMenuService(); // ✅ Fresh instance
  const controller = new MenuController(service);
  controller.handleRequest(req, res);
});
```

❌ **DON'T: Cache service instances**
```typescript
// ❌ WRONG - service cached at router creation
const service = DIContainer.createMenuService();
router.get('/path', (req, res) => {
  // Uses stale cached service - tests will fail
});
```
- Change via `PORT` in `.env` file
