# Docker Setup Guide for DotVacay

## Quick Start

### 1. Generate JWT Key
```bash
# Generate a random 256-bit key
openssl rand -base64 32
```

### 2. Create Environment File
```bash
cp .env.example .env
# Edit .env and replace DOTVACAY_JWT_KEY with the generated key from step 1
```

### 3. Start Containers
```bash
# From the workspace root (where docker-compose.yml is located)
docker-compose up --build
```

### 4. Access Application
- **Frontend**: http://localhost:50316
- **Backend API**: http://localhost:5111/api
- **Swagger Documentation**: http://localhost:5111/swagger
- **Health Check**: http://localhost:5111/api/health

## Development Features

### Hot Reload
- **Backend**: `dotnet watch` automatically recompiles on file changes
- **Frontend**: Vite dev server automatically rebuilds on file changes
- No manual rebuild required!

### Database Persistence
- SQLite database stored in Docker volume: `dotvacay_db`
- Location in container: `/app/data/dotvacay.db`
- Data persists across container restarts

### Logs
```bash
# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend

# View all logs
docker-compose logs -f
```

## Useful Commands

### Stop Services
```bash
docker-compose down
```

### Full Clean (removes volumes)
```bash
docker-compose down --volumes
docker-compose up --build
```

### Rebuild Specific Service
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Execute Commands in Container
```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Run migrations manually (usually automatic)
docker-compose exec backend dotnet ef database update --project DotVacay.API --connection "Data Source=/app/data/dotvacay.db"
```

### View Container Status
```bash
docker-compose ps
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Docker Compose Network                │
│                                                     │
│  ┌─────────────────────┐      ┌─────────────────────┐ │
│  │   Frontend         │─────▶│   Backend          │ │
│  │   Port: 50316      │      │   Port: 5111       │ │
│  │   Vite Dev          │      │   .NET 9 API        │ │
│  │   Server           │      │   Hot Reload        │ │
│  │                    │      │   SQLite DB         │ │
│  └─────────────────────┘      └─────────────────────┘ │
│          │                           │                │
│          │ Source Volume              │ Volume         │
│          │ for Live Editing          │ for Data       │
│          └───────────────────────────┘                │
└─────────────────────────────────────────────────────┘
```

## Environment Variables

Required variables in `.env`:

```env
# JWT Configuration (REQUIRED)
DOTVACAY_JWT_KEY=your-256-bit-random-key
DOTVACAY_JWT_ISSUER=https://localhost:5111
DOTVACAY_JWT_AUDIENCE=https://localhost:5111
DOTVACAY_JWT_EXPIREDAYS=30

# CORS Origins (REQUIRED)
DOTVACAY_CORS_ORIGINS=http://localhost:50316,https://localhost:50316,http://frontend:50316,https://frontend:50316

# Database Path (Optional - defaults to /app/data/dotvacay.db)
DOTVACAY_DB_PATH=/app/data/dotvacay.db

# OpenAI API Key (Optional - AI features currently disabled)
# DOTVACAY_OPENAI_APIKEY=your-openai-api-key
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using ports
lsof -i :5111
lsof -i :50316

# Kill process if needed
kill -9 <PID>
```

### Hot Reload Not Working
- Backend: Ensure `DOTNET_USE_POLLING_FILE_WATCHER=1` is set (included in Dockerfile)
- Both: File changes should appear within 1-2 seconds

### CORS Errors
- Verify `http://frontend:50316` is in `DOTVACAY_CORS_ORIGINS` in `.env`
- Check browser console for specific CORS errors

### Database Issues
```bash
# Recreate database volume (WARNING: deletes all data)
docker-compose down --volumes
docker-compose up --build
```

### Container Won't Start
```bash
# Check container logs for errors
docker-compose logs backend
docker-compose logs frontend

# Check container status
docker-compose ps
```

## Network Configuration

- Services communicate via Docker network: `dotvacay-network`
- Frontend proxy uses `http://backend:5111` (Docker service name)
- External access: `http://localhost:5111` and `http://localhost:50316`

## File Watching

Docker volumes on macOS (Apple Silicon) use file system watchers:
- Backend: `DOTNET_USE_POLLING_FILE_WATCHER=1` enables polling
- Frontend: Vite handles file watching automatically
- Changes propagate in 1-2 seconds

## Removing AI Features

AI features (`AiSuggestionService`) are commented out in `Program.cs`:
- Code is preserved but not registered in DI container
- To re-enable: Uncomment line 74 in `src/DotVacay.API/Program.cs`
- OpenAI API key still optional in `.env`

## Production Deployment Notes

This setup is for **development only**. For production:
1. Change `ASPNETCORE_ENVIRONMENT` to `Production`
2. Use optimized Dockerfiles (not `.dev` variants)
3. Use separate build artifacts, no hot reload
4. Use managed database (SQL Server, PostgreSQL)
5. Use proper secrets management (not `.env` file)
6. Configure proper CORS origins
7. Use Nginx reverse proxy for static assets
8. Add SSL/TLS certificates
