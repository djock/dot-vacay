# AGENTS.md

This file contains guidelines for agentic coding assistants working on the DotVacay repository.

## Build, Lint, and Test Commands

### Docker Development (Preferred)
- **Build and start all services:** `docker-compose up --build`
- **Stop services:** `docker-compose down`
- **Clean rebuild:** `docker-compose down --volumes && docker-compose up --build`
- **View logs:** `docker-compose logs -f backend` or `docker-compose logs -f frontend`
- **Rebuild specific service:** `docker-compose up --build backend` or `docker-compose up --build frontend`
- **Execute commands in container:** `docker-compose exec backend sh` or `docker-compose exec frontend sh`

### .NET Backend (Local)
- **Build solution:** `cd src && dotnet build`
- **Run API:** `dotnet run --project DotVacay.API` (listens on http://localhost:5111)
- **Update database:** `dotnet ef database update --project DotVacay.API`
- **Create migration:** `dotnet ef migrations add <MigrationName> --project DotVacay.Infrastructure`
- **No test framework configured** - tests are not currently set up in this repository

### Angular Frontend
- **Install dependencies:** `cd src/DotVacay.WebNg && npm install`
- **Start dev server:** `npm start` (runs on http://localhost:4200, uses proxy.conf.json)
- **Build:** `npm run build`
- **Watch:** `npm run watch`
- **Run tests:** `npm test` (uses Karma/Jasmine)

### Running Single Tests
Angular (Jasmine/Karma):
- Run specific test file: `ng test --include='<path-to-spec-file>'`
- Run matching test pattern: `ng test --include='**/*trip*.spec.ts'`

.NET tests: No test framework is currently configured.

## Architecture Overview

DotVacay follows Clean Architecture with separation of concerns:

```
DotVacay.API          - Presentation layer (Controllers, endpoints)
DotVacay.Application   - Application services, business logic orchestration
DotVacay.Core          - Domain entities, interfaces, models (no dependencies)
DotVacay.Infrastructure- Data access (EF Core), external services
DotVacay.Web          - Legacy ASP.NET MVC (deprecated, use WebNg)
DotVacay.WebNg        - Angular 19 SPA frontend
```

## C# Code Style Guidelines

### Imports and Formatting
- **Implicit usings enabled** - omit common namespace imports (System, Microsoft.AspNetCore.Mvc, etc.)
- **Nullable reference types enabled** - always handle potential nulls
- Use primary constructors where appropriate: `public class MyClass(IService service)`
- Order imports: external (system) first, then internal (DotVacay.*), alphabetically

### Naming Conventions
- **Classes:** PascalCase (e.g., `TripService`, `ApplicationUser`)
- **Interfaces:** IPascalCase (e.g., `ITripService`, `ITripRepository`)
- **Methods:** PascalCase (e.g., `CreateAsync`, `GetById`)
- **Properties:** PascalCase (e.g., `UserId`, `TripTitle`)
- **Local variables:** camelCase (e.g., `trip`, `result`)
- **Constants:** PascalCase (e.g., `NotFound`, `UserNotFound`)
- **Records:** PascalCase (e.g., `TripResult`, `CreateTripRequest`)
- **Async methods:** End with `Async` suffix (e.g., `CreateAsync`, `GetByIdAsync`)

### Types and Models
- Use **records** for immutable DTOs, requests, and results
- Result pattern: Always return result objects with `Success`, `Data`, and optional `Errors`
- Use required modifier for non-nullable properties: `public required string Title { get; set; }`
- Collection initializers: `public ICollection<UserTrip> UserTrips { get; set; } = [];`

### Error Handling
- Centralize errors in `DotVacay.Core.Common.DomainErrors` using nested static classes
- Return error objects instead of throwing exceptions for business logic failures
- Controller pattern: Check `result.Success` and return appropriate status codes
- Use switch expressions for error mapping: `errors.FirstOrDefault() switch { "Forbidden" => Forbid(), _ => BadRequest() }`

### Controller Guidelines
- Use primary constructor injection: `public class TripController(ITripService service)`
- Add `[ApiController]`, `[Route]`, and `[Authorize]` attributes
- Use `[ProducesResponseType]` attributes for Swagger documentation
- Map JWT claims: `private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";`

### Repository Pattern
- Define interfaces in `Core.Interfaces.Repositories`
- Implement in `Infrastructure.Repositories`
- Return nullable for single-item lookups: `Task<T?> GetByIdAsync(int id)`
- Use EF Core with async methods: `FirstOrDefaultAsync`, `ToListAsync`, `SaveChangesAsync`

### Service Layer
- Services are in `Application.Services`
- Interfaces in `Core.Interfaces.Services`
- Inject repositories and other services via primary constructors
- Validate business rules and return appropriate result objects

## TypeScript/Angular Code Style Guidelines

### Imports and Formatting
- **Single quotes for strings** (enforced by .editorconfig)
- **2-space indentation**
- Import order: Angular modules first, then third-party, then app imports
- Use path aliases: `@services/*`, `@models/*`, `@components/*`, `@app/*`

### Component Structure
- Prefer **standalone components** (common in this codebase)
- Declare imports array in @Component decorator
- Use `standalone: true` and explicit imports: `imports: [CommonModule, FormsModule, RouterModule]`
- Selector kebab-case: `selector: 'trip-list-item'`

### Naming Conventions
- **Files:** kebab-case with component type suffix (e.g., `trips-list.component.ts`, `auth.guard.ts`)
- **Classes:** PascalCase (e.g., `TripsListComponent`, `AuthService`)
- **Properties/methods:** camelCase (e.g., `loadTrips()`, `errorMessage`)
- **Interfaces:** PascalCase, no prefix (e.g., `TripService`, not `ITripService`)
- **Constants:** UPPER_SNAKE_CASE or PascalCase (be consistent)

### Services
- Use `@Injectable({ providedIn: 'root' })` for singleton services
- Inject dependencies in constructor
- Return `Observable<T>` for HTTP calls
- Use RxJS operators for data transformation (`tap`, `map`, `filter`)
- Define local interfaces for API responses when not in models

### HTTP Requests
- All HTTP calls go through `ApiService` (wrapper around HttpClient)
- API base URL from `environment.apiUrl`
- JWT token stored in localStorage, added as Bearer auth header
- Methods: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`, `patch<T>()`

### Guards
- Implement `CanActivate` interface
- Return `boolean` or redirect to login if not authenticated
- Check auth via `AuthService.isAuthenticated()`

### Routing
- Define routes in `app-routing.module.ts`
- Use lazy loading for routes: `loadComponent: () => import(...).then(m => m.Component)`
- Protect routes with `canActivate: [AuthGuard]`

## Database Guidelines

- Entity Framework Core 9.0 with SQLite (dev) / SQL Server (prod)
- `ApplicationDbContext` in `Infrastructure.Data`
- Migrations project: `DotVacay.Infrastructure`
- Use navigation properties for relationships
- Configure relationships in `OnModelCreating` if needed
- Run migrations after entity changes: `dotnet ef database update --project DotVacay.API`

## Environment Configuration

- Backend uses `appsettings.json`, `appsettings.Development.json`, and environment variables
- Use `DOTVACAY_` prefix for environment variables
- Required: `DOTVACAY_OPENAI_APIKEY` for AI suggestions
- Frontend uses `environment.ts` and `environment.prod.ts`
- API base URL configured in `environment.apiUrl`

## Testing Notes

- No .NET test framework currently configured (no XUnit/NUnit/MSTest projects)
- Angular tests use Karma + Jasmine
- Test files use `.spec.ts` extension
- Run with `npm test` from `DotVacay.WebNg` directory

## Additional Notes

- Avoid deprecated `DotVacay.Web` (ASP.NET MVC) - use `DotVacay.WebNg` (Angular)
- JWT authentication with bearer tokens
- CORS configured for allowed origins
- OpenAPI/Swagger available at `/swagger` in dev mode
- Code uses modern C# features: records, pattern matching, switch expressions
- Angular 19 with standalone components is the preferred approach
