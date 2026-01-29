# DotVacay - Travel Planning Made Easy

DotVacay is a web application designed to help travelers plan and organize their trips efficiently. It provides a user-friendly interface for creating, managing, and sharing travel itineraries with friends and family.

## Features

- **Trip Management**
  - Create and organize multiple trips
  - Set trip dates and add descriptions
  - Share trips with other users
  - Delete or leave trips

- **Point of Interest (POI) Management**
  - Add various types of points of interest:
    - Hotels
    - Car Rentals
    - Food & Dining
    - Places to Visit
  - Set specific dates and times for each POI
  - Add descriptions, URLs, and addresses
  - Edit or delete existing POIs

- **Daily Itinerary View**
  - Visual timeline of activities for each day
  - Clear display of start and end times
  - All-day event support
  - Easy addition of new POIs to specific days

- **Location Search**
  - OpenStreetMap integration for location search
  - Geocoding support for addresses and points of interest
  - Interactive map display

## Technology Stack

- **Backend**
  - .NET 9.0 Web API
  - Entity Framework Core
  - SQL Server Database
  - JWT Authentication

- **Frontend**
  - React 19 + Vite (main frontend)
  - Tailwind (via CDN)
  - OpenStreetMap API integration

## Project Structure

```
DotVacay/
├── src/
│   ├── DotVacay.API/              # Web API Project
│   │   ├── Controllers/           # API Controllers
│   │   └── Program.cs             # API Entry Point
│   │
│   ├── DotVacay.Application/      # Application Services
│   │   ├── DTOs/                  # Application DTOs
│   │   └── Services/              # Business Logic Services
│   │
│   ├── DotVacay.Core/             # Core Business Logic
│   │   ├── Entities/              # Domain Entities
│   │   ├── Enums/                 # Enumerations
│   │   ├── Interfaces/            # Repositories and Services 
│   │   └── Models/                # DTOs and Request/Result models
│   │
│   ├── DotVacay.Infrastructure/   # Data Access & External Services
│   │   ├── Data/                  # Database Context
│   │   └── Repositories/          # Data Access Layer
│   │
│   ├── DotVacay.Web/              # Deprecated ASP.NET MVC Web Application
│   │   ├── Controllers/           # MVC Controllers
│   │   ├── Models/                # View Models
│   │   ├── Views/                 # Razor Views
│   │   └── Program.cs             # Web Entry Point
│   │
│   ├── DotVacay.WebReact/         # React + Vite Web Application (main)
│   └── DotVacay.WebNg/            # Angular Web Application (legacy)
```

## Docker Development Setup

### Prerequisites
- Docker Desktop for Mac (or Docker CLI with Colima/OrbStack)
- Copy `.env.example` to `.env` and set your JWT key

### Quick Start

1. **Generate JWT key** (in .env file):
   ```bash
   # Generate a random 256-bit key
   openssl rand -base64 32
   ```

2. **Create .env file**:
   ```bash
   cp .env.example .env
   # Edit .env and replace DOTVACAY_JWT_KEY with generated key
   ```

3. **Start containers**:
   ```bash
   docker compose up --build
   ```

4. **Access application**:
   - Frontend: http://localhost:50316
   - Backend API: http://localhost:5111/api
   - API Documentation: http://localhost:5111/swagger
   - Health Check: http://localhost:5111/api/health

### Development Workflow

- **Hot Reload**: Code changes are automatically reflected in both backend and frontend
- **Backend Logs**: `docker compose logs -f backend`
- **Frontend Logs**: `docker compose logs -f frontend`
- **Stop Containers**: `docker compose down`
- **Clean Build**: `docker compose down --volumes && docker compose up --build`

### Database

- SQLite database persists in Docker volume: `dotvacay_db`
- Database file location in container: `/app/data/dotvacay.db`
- Migrations run automatically on container startup

### Troubleshooting

If hot reload isn't working:
- Backend: Check that `DOTNET_USE_POLLING_FILE_WATCHER=1` is set (included in Dockerfile)
- Ensure you're on macOS (Apple Silicon) - Dockerfile uses `dotnet/sdk:9.0` which supports arm64

If CORS errors occur:
- Ensure `http://frontend:50316` is in `DOTVACAY_CORS_ORIGINS` in .env

### Traditional Development Setup

### Prerequisites
- .NET 9.0 SDK
- SQL Server
- Node.js 18+ and npm
- Vite (via npm scripts)

### Backend Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/djock/dot-vacay.git
   cd dot-vacay
   ```

2. **Update database**
   ```bash
   cd src
   dotnet ef database update --project DotVacay.API
   ```

3. **Run the API**
   ```bash
   dotnet run --project DotVacay.API
   ```
   The API will be available at http://localhost:5111 with Swagger documentation at http://localhost:5111/swagger/index.json

### Frontend Setup (React)
1. **Install dependencies**
   ```bash
   cd src/DotVacay.WebReact
   npm install
   ```

2. **Run the Vite application**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:50316

## Environment Variables

DotVacay uses environment variables for configuration, especially for sensitive information like API keys.

### Required Environment Variables

- `DOTVACAY_JWT_KEY`: Your JWT signing key (generate with `openssl rand -base64 32`)
- `DOTVACAY_OPENAI_APIKEY`: Your OpenAI API key (optional - AI features disabled in Docker mode)

### Setting Environment Variables

#### Development (Windows)

PowerShell (temporary, for current session):
```powershell
$env:DOTVACAY_OPENAI_APIKEY = "your-api-key-here"
```

Permanently (System Properties > Advanced > Environment Variables)

Or use the provided setup script:
```powershell
.\setup-dev-env.ps1 "your-api-key-here"
```

#### Development (macOS/Linux)

Bash/Zsh (temporary, for current session):
```bash
export DOTVACAY_OPENAI_APIKEY="your-api-key-here"
```

Permanently (add to ~/.bashrc or ~/.zshrc)

Or use the provided setup script:
```bash
chmod +x ./setup-dev-env.sh
./setup-dev-env.sh "your-api-key-here"
```

#### Production

For production environments, set environment variables according to your hosting platform:

- **Docker**: Use `-e DOTVACAY_OPENAI_APIKEY=your-api-key` when running containers
- **Azure App Service**: Configure in Application Settings
- **AWS**: Use environment variables in your task definitions or Lambda configurations
- **Kubernetes**: Use secrets and environment variables in your pod specifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Created by Ionut Mocanu
- Inspired by Wanderlog and built as a learning project
