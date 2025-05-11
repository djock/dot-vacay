# PowerShell script to set up development environment variables
param(
    [Parameter(Mandatory=$true)]
    [string]$OpenAiApiKey
)

# Set environment variables for the current session
$env:DOTVACAY_OPENAI_APIKEY = $OpenAiApiKey

# Output confirmation
Write-Host "Environment variables set for development:"
Write-Host "DOTVACAY_OPENAI_APIKEY: $($OpenAiApiKey.Substring(0, 5))..." -ForegroundColor Green

# Instructions for permanent setup
Write-Host "`nTo set these environment variables permanently:" -ForegroundColor Yellow
Write-Host "1. Open System Properties > Advanced > Environment Variables" -ForegroundColor Yellow
Write-Host "2. Add a new User variable named 'DOTVACAY_OPENAI_APIKEY' with your API key" -ForegroundColor Yellow
Write-Host "`nOr use the .NET User Secrets for development:" -ForegroundColor Yellow
Write-Host "dotnet user-secrets set ""OpenAI:ApiKey"" ""$OpenAiApiKey""" -ForegroundColor Yellow

# Launch the API project
Write-Host "`nLaunching the API project..." -ForegroundColor Cyan
dotnet run --project DotVacay.API