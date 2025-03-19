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


## Technology Stack

- **Backend**
  - .NET Core Web API
  - Entity Framework Core
  - SQL Server Database
  - JWT Authentication

- **Frontend**
  - ASP.NET Core MVC
  - Bootstrap 5
  - jQuery
  - Bootstrap Icons

## Project Structure

```
DotVacay/
├── DotVacay.API/              # Web API Project
│   └── Controllers           # API Controllers
│
├── DotVacay.Application/     # Application Services
│   ├── DTOs/                # Application DTOs
│   └── Services/            # Business Logic Services
│
├── DotVacay.Core/             # Core Business Logic
│   ├── Entities/             # Domain Entities
│   ├── Enums/               # Enumerations
│   ├── Interfaces/              # Repositories and Services 
│   └── Models/             # Dtos and Request /Result models

├── DotVacay.Infrastructure/   # Data Access & External Services
│   ├── Data/                # Database Context
│   └── Repositories/        # Data Access Layer
└── DotVacay.Web/            # Web Application
    ├── Controllers/         # MVC Controllers
    ├── Models/             # View Models
    ├── Views/              # Razor Views
    │   ├── Trip/
    │   ├── PointOfInterest/
    │   └── Shared/
    ├── wwwroot/            # Static Files
    │   ├── css/
    │   ├── js/
    │   └── lib/
    └── Program.cs          # Web Entry Point
```

## Getting Started

1. **Prerequisites**
   - .NET 9.0 SDK
   - SQL Server
   - Visual Studio 2022 or later

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/djock/dot-vacay.git

   # Open the solution in Visual Studio

   # Update database
   dotnet ef database update
   ```

3. **Configuration**
   - Update the connection string in `appsettings.json`
   - Configure JWT settings if needed

4. **Running the Application**
   ```bash
   dotnet run --project DotVacay.ApiWeb
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Created by Ionut Mocanu
- Inspired by Wanderlog and built as a learning project
