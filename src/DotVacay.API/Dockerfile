# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DotVacay.API/DotVacay.API.csproj", "DotVacay.API/"]
COPY ["DotVacay.Application/DotVacay.Application.csproj", "DotVacay.Application/"]
COPY ["DotVacay.Core/DotVacay.Core.csproj", "DotVacay.Core/"]
COPY ["DotVacay.Infrastructure/DotVacay.Infrastructure.csproj", "DotVacay.Infrastructure/"]
RUN dotnet restore "DotVacay.API/DotVacay.API.csproj"
COPY . .
WORKDIR "/src/DotVacay.API"
RUN dotnet build "DotVacay.API.csproj" -c Release -o /app/build

# Development runtime stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS development
WORKDIR /app

# Copy build output
COPY --from=build /app/build ./build

# Create non-root user and directories
RUN adduser -u 1000 appuser && \
    mkdir -p /app/src /app/data && \
    chown -R appuser:appuser /app

USER appuser

# Expose ports
EXPOSE 5111 8000

# Set environment for hot reload
ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV ASPNETCORE_ENVIRONMENT=Development

CMD ["dotnet", "watch", "--project", "/app/src/DotVacay.API", "--urls", "http://0.0.0.0:5111", "--non-interactive"]
