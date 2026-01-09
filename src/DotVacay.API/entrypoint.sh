#!/bin/sh
set -e

# Run database migrations
echo "Running database migrations..."
cd /app/src/DotVacay.API
~/.dotnet/tools/dotnet-ef database update --connection "Data Source=/app/data/dotvacay.db"

# Start the application with hot reload
echo "Starting application with hot reload..."
exec dotnet watch --project /app/src/DotVacay.API --non-interactive
