# TypeScript Backend - AIWaiter

Modern, type-safe Express backend with Repository Pattern and static methods.

## Quick Start

```powershell
npm install
npm run dev      # Start on port 5001 with hot reload
npm test         # Run 49 integration tests
```

## Architecture at a Glance

```
Routes → Static Controllers → Static Services → RepositoryFactory → Repositories
```

- **Static Methods**: Services/controllers are stateless (no constructors, zero per-request overhead)
- **Repository Pattern**: Only repositories use interfaces (Mock → Postgres swap coming)
- **AsyncLocalStorage**: Automatic request context propagation (no `req.log` pollution)
- **Zod Validation**: Type-safe request validation
- **Winston Logging**: Structured JSON logs with automatic requestId

## Key Features

✅ **49 Integration Tests** - Full endpoint coverage  
✅ **LiveKit Integration** - JWT token generation for voice/video rooms  
✅ **Type Safety** - Strict TypeScript, no `any` types  
✅ **AppResponse<T>** - Standardized response format  
✅ **Test Isolation** - `RepositoryFactory.reset()` in `beforeEach()`  

## Documentation

- **[GEMINI.md](./GEMINI.md)** - Comprehensive technical reference (1033 lines)
  - Architecture patterns and design decisions
  - LiveKit JWT integration details
  - Testing strategies and examples
  - Step-by-step feature addition guide

- **[copilot-instructions.md](../.github/copilot-instructions.md)** - Development conventions (322 lines)
  - Collaboration workflow patterns
  - Code quality standards
  - Common pitfalls and solutions

## Environment Setup

Create `.env` in `ts_backend/`:

```env
PORT=5001
NODE_ENV=development
LOG_LEVEL=info
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

Get LiveKit credentials from: https://cloud.livekit.io/

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/get-token` | Generate LiveKit token |
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu/specials` | Get special items |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create new order |
| GET | `/api/users/:userId` | Get user by ID |

All endpoints return JSON with `{ success: boolean, data?: T, message?: string, status?: number }`.

## Testing

```powershell
npm test              # Run all 49 tests serially
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

Tests use `--runInBand` to prevent race conditions. All tests include `RepositoryFactory.reset()` in `beforeEach()` for isolation.

## Project Structure

```
src/
├── api/
│   ├── controllers/  # Static HTTP handlers
│   └── routes/       # Route definitions + Zod validation
├── middleware/       # Request ID, validation, error handling
├── repositories/     # Data access layer (interfaces + mock implementations)
├── services/         # Business logic (static methods)
├── types/            # TypeScript types and Zod schemas
└── utils/            # Logger with AsyncLocalStorage

tests/
└── api/              # 49 integration tests
```

## Design Philosophy

**YAGNI (You Aren't Gonna Need It)** - Only add complexity where there's concrete value:
- ✅ **Repositories get DI** - Will be swapped (Mock → Postgres)
- ❌ **Services/controllers don't** - Stateless logic, no swapping needed
- Result: **60% less code** than full DI approach

## Migration Status

✅ **Feature parity with JS backend** - All endpoints migrated and tested  
✅ **LiveKit integration** - Token generation fully implemented  
✅ **Production ready** - Comprehensive tests, logging, error handling  

## Common Commands

```powershell
# Development
npm run dev

# Production
npm run build  # Compile to dist/
npm start      # Run compiled code

# Testing
npm test                           # All tests
npm test -- tests/api/menu.test.ts # Specific file
npm run test:watch                 # Watch mode

# Linting
npm run lint
```

## Troubleshooting

**Issue**: Tests fail with stale data  
**Solution**: Ensure `RepositoryFactory.reset()` in `beforeEach()`

**Issue**: requestId not in logs  
**Solution**: Check `requestIdMiddleware` is first in middleware chain

**Issue**: LiveKit token generation fails  
**Solution**: Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in `.env`

**Issue**: Port already in use  
**Solution**: Change `PORT` in `.env` or kill process on port 5001

## Learn More

- Read [GEMINI.md](./GEMINI.md) for complete architecture details
- See [copilot-instructions.md](../.github/copilot-instructions.md) for development patterns
- Check `tests/api/` for usage examples of all endpoints
