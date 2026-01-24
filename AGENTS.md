# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an Express.js learning repository organized into progressive lessons (Express-day1, Express-day2). It demonstrates Express.js fundamentals, middleware patterns, error handling, and cookie/session management. The project uses ES6 modules (`"type": "module"` in package.json).

## Common Commands

### Development
```bash
# Start the server (runs test-requests.js in root)
npm start

# Start with auto-reload
npm run dev

# Install dependencies
npm install
```

### Testing
There is no formal test suite. Instead, the project uses `test-requests.js` to make HTTP requests and validate responses against expected status codes. The server must be running separately before executing test-requests.js.

## Architecture and Code Structure

### Two-Layer Learning Structure
The codebase is split into two progressive lessons:

**Express-day1/** - Basic Express fundamentals
- Classic MVC pattern: `controllers/`, `routes/`, `middleware/`
- Entry point: `src/server.js` → imports `src/app.js`
- Simple error handling with custom status properties on Error objects
- Basic logger middleware tracking request duration

**Express-day2/** - Advanced middleware patterns
- Organized by concern: `middleware/`, `utils/`, `errors/`
- Entry point: `test-requests.js` at root (not in src/)
- Reusable utility modules for common Express patterns

### Key Architectural Patterns

#### Error Handling (Express-day2)
The project implements a comprehensive error handling system:

- **AppError class** (middleware/error-types.js): Base operational error class with factory methods (`badRequest()`, `notFound()`, `unauthorized()`, etc.)
- **Specialized errors**: ValidationError, DatabaseError, AuthenticationError, AuthorizationError
- **Central error handler** (middleware/error-handler.js): Handles all errors, logs details, differentiates development vs production responses, handles MongoDB duplicate keys, JWT errors, etc.
- **404 handlers**: Two versions - basic `notFoundHandler` and `smartNotFoundHandler` that suggests similar routes

Error objects include:
- `statusCode`: HTTP status
- `status`: "fail" (4xx) or "error" (5xx)
- `isOperational`: distinguishes operational vs programming errors
- `details`: additional context

#### Middleware Utilities (Express-day2)

**Request Analysis** (middleware/request-analyzer.js):
- `requestAnalyzer`: Adds request ID, logs incoming requests, tracks response time, adds `X-Response-Time-ms` and `X-Request-ID` headers
- `requestValidator`: Schema-based validation for body, query, and params

**Response Helpers** (middleware/response-helpers.js):
Extends `res` object with convenience methods:
- `res.success(data, message, statusCode)`
- `res.created(data, message, statusCode)`
- `res.noContent(message, statusCode)`
- `res.paginated(data, page, limit, total, message)`
- `res.error(message, statusCode, details)`

**Body Parser Configuration** (utils/body-parser-config.js):
- `bodyParserConfig(app)`: Configures multiple content types (JSON, urlencoded, text, raw) with 10mb limit and raw body preservation
- `customBodyParser`: Conditional parser based on content-type

**Async Handling** (utils/async-handler.js):
- `asyncHandler(fn)`: Wraps async route handlers to catch rejected promises
- `asyncHandlerWithTimeout(fn, timeoutMs)`: Adds timeout protection with configurable threshold (default 5000ms)

**Cookie Management** (utils/cookie-manager.js):
- `cookieManager(app)`: Adds helper methods to req/res:
  - `res.setCookie(name, value, options)`: Sets cookies with secure defaults (httpOnly, sameSite strict, 24h maxAge)
  - `req.getCookie(name, defaultValue)`: Safe cookie retrieval
  - `res.clearCookieSafe(name, options)`: Properly clears cookies
- `cookieAuth(options)`: Simple cookie-based auth middleware with public routes support

**Session Management** (utils/session-manager.js):
Currently incomplete - only imports express-session and uuid v4

### Module System
All files use ES6 import/export syntax. When creating new files, always use:
```javascript
import x from 'y';
export const foo = ...;
export default bar;
```

### Common Patterns

**Route Handler Pattern:**
```javascript
import { asyncHandler } from '../utils/async-handler.js';

export const controller = {
  method: asyncHandler(async (req, res, next) => {
    // Your logic
    res.success(data, 'Success message');
  })
};
```

**Error Creation:**
```javascript
import { AppError } from '../middleware/error-types.js';

// Use factory methods
throw AppError.badRequest('Invalid input', { field: 'email' });
throw AppError.notFound('User not found');
throw AppError.unauthorized('Invalid token');
```

**Middleware Registration Order (Express-day2):**
1. Body parser configuration
2. Cookie manager
3. Request analyzer
4. Response helpers
5. Routes
6. 404 handler (notFoundHandler or smartNotFoundHandler)
7. Error handler (must be last)

## Development Notes

### Port Configuration
Default port is 3000. Set `PORT` environment variable to override.

### Environment Variables
- `NODE_ENV`: Controls error verbosity ("development" shows stack traces)
- `PORT`: Server port (default 3000)

### Server Lifecycle
Express-day1's server.js implements graceful shutdown handlers for SIGTERM and SIGINT signals.

### Incomplete Code
- `utils/session-manager.js` is incomplete (only has imports)
- `errors/` directory exists but is empty
- Express-day1 has some syntax errors (e.g., `user.route.js` references undefined `authMiddlware`)

## File Naming Conventions
- Kebab-case for filenames: `error-handler.js`, `cookie-manager.js`
- Suffix patterns: `*.middleware.js`, `*.controller.js`, `*.route.js`
