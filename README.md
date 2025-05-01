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
  - Angular 19
  - Bootstrap 5
  - ngx-bootstrap
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
│   └── DotVacay.WebNg/            # Angular Web Application
│       ├── src/                   # Angular source code
│       │   ├── app/               # Application components
│       │   │   ├── components/    # UI Component
│       │   │   ├── pages/         # Pages
│       │   │   ├── models/        # Models
│       │   │   └── services/      # Services
│       └── angular.json           # Angular configuration
```

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- SQL Server
- Node.js 18+ and npm
- Angular CLI 19+

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

### Frontend Setup
1. **Install Angular dependencies**
   ```bash
   cd src/DotVacay.WebNg
   npm install
   ```

2. **Run the Angular application**
   ```bash
   npm start
   ```
   The application will be available at http://localhost:4200

## Environment Variables

DotVacay uses environment variables for configuration, especially for sensitive information like API keys.

### Required Environment Variables

- `DOTVACAY_OPENAI_APIKEY`: Your OpenAI API key

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

