# TypeScript Backend Documentation

This document provides a comprehensive overview of the TypeScript backend, which is a modern, type-safe reimplementation of the JavaScript backend with improved architecture and testing.

## Architecture

The TypeScript backend follows the **Repository Pattern** with **Dependency Injection**, providing clean separation of concerns and testability:

### Layers

1. **Repositories** (`src/repositories/`)
   - **Interfaces** (`interfaces/`) - Define contracts for data access (IMenuRepository, IOrderRepository, IUserRepository)
   - **Implementations** (`implementations/`) - Concrete implementations (currently mock data, designed for easy database integration)
   - **Factory** (`RepositoryFactory.ts`) - Singleton factory providing repository instances with `reset()` for testing

2. **Services** (`src/services/`)
   - Business logic layer that consumes repositories
   - Returns standardized `AppResponse<T>` from `types/common.ts`
   - Uses constructor injection for repositories and logger
   - **Created per-request** (not cached) to support test isolation

3. **Controllers** (`src/api/controllers/`)
   - HTTP request/response handling
   - Thin layer that delegates to services
   - Handles status code mapping from service responses

4. **Routes** (`src/api/routes/`)
   - Route definitions with Zod validation middleware
   - Creates fresh service instances per request
   - Mounted at `/api` prefix

5. **Middleware** (`src/middleware/`)
   - `requestId.ts` - Assigns unique ID to each request and creates request-scoped logger
   - `validation.ts` - Zod schema validation middleware factory
   - `errorHandler.ts` - Centralized error handling

### Data Flow

```
Request → Middleware (ID, Validation) → Route → Controller → Service → Repository → Data
                                                                         ↓
Response ← Controller ← AppResponse<T> ← Service ← Repository Data
```

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

### Request-Scoped Logging
Winston logger with unique request IDs:

```typescript
app.use(requestIdMiddleware); // Adds req.id and req.log

// Usage in services/controllers
this.logger.info(`Processing request for user ${userId}`);
req.log.error(`Validation failed: ${error.message}`);
```

## Testing Strategy

### Test Structure
- **Integration tests** in `tests/api/` using Jest + Supertest
- **33 comprehensive tests** covering all endpoints
- **Serial execution** (`--runInBand`) to prevent race conditions
- **Test isolation** via `RepositoryFactory.reset()` in `beforeEach()`

### Test Pattern Example
```typescript
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
2. **Services must be created per-request** - not cached at router initialization
3. **Use unique test data IDs** to avoid conflicts between tests
4. **TypeScript config** must include `tests/**/*` for VS Code IntelliSense

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

### 4. Update Repository Factory
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
    this.newRepository = undefined;
}
```

### 5. Create Service
In `src/services/NewService.ts`:
```typescript
export class NewService {
    constructor(
        private newRepository: INewRepository,
        private logger: Logger
    ) {}

    getAll(): AppResponse<NewEntity[]> {
        try {
            const entities = this.newRepository.getAll();
            return { success: true, data: entities, status: 200 };
        } catch (err) {
            this.logger.error(`Error fetching entities: ${err.message}`);
            return { success: false, message: 'Internal server error' };
        }
    }
}
```

### 6. Create Controller
In `src/api/controllers/NewController.ts`:
```typescript
export class NewController {
    constructor(private newService: NewService) {}

    getAll = (req: Request, res: Response): void => {
        req.log.info('GET /api/new');
        const result = this.newService.getAll();
        
        if (result.success) {
            res.status(result.status || 200).json(result);
        } else {
            res.status(result.status || 500).json(result);
        }
    };
}
```

### 7. Create Routes with Validation
In `src/api/routes/newRoutes.ts`:
```typescript
export function createNewRouter(): Router {
    const router = Router();
    
    // Helper to get fresh service instance
    function getNewService(): NewService {
        const repo = RepositoryFactory.getNewRepository();
        return new NewService(repo, logger);
    }
    
    router.get('/', validate(newSchema), (req, res) => {
        const controller = new NewController(getNewService());
        controller.getAll(req, res);
    });
    
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
describe('New API Endpoints', () => {
    beforeEach(() => {
        RepositoryFactory.reset();
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

| Aspect | JS Backend (MVP) | TS Backend (Repository) |
|--------|------------------|------------------------|
| **Architecture** | Model-View-Presenter | Repository-Service-Controller |
| **Data Layer** | Direct model calls | Repository interfaces |
| **Business Logic** | Presenters | Services |
| **Response Format** | Varied | Standardized AppResponse<T> |
| **Validation** | Manual | Zod schemas |
| **Testing** | None | 33 integration tests |
| **Type Safety** | JavaScript | Strict TypeScript |
| **Port** | 5000 | 5001 |
| **DI Support** | No | Yes (constructor injection) |

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
- Verify services are created per-request, not cached

### Compilation Errors
- Run `tsc --noEmit` to check for TypeScript errors
- Ensure `"skipLibCheck": true` in tsconfig.json
- Check that custom types are in `typeRoots`

### Port Conflicts
- TS backend uses port 5001 by default
- JS backend uses port 5000
- Change via `PORT` in `.env` file
