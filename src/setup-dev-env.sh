#!/bin/bash
# Bash script to set up development environment variables

if [ $# -eq 0 ]; then
    echo "Error: OpenAI API key is required"
    echo "Usage: ./setup-dev-env.sh YOUR_OPENAI_API_KEY"
    exit 1
fi

OPENAI_API_KEY=$1

# Set environment variables for the current session
export DOTVACAY_OPENAI_APIKEY=$OPENAI_API_KEY

# Output confirmation
echo "Environment variables set for development:"
echo "DOTVACAY_OPENAI_APIKEY: ${OPENAI_API_KEY:0:5}..."

# Instructions for permanent setup
echo -e "\nTo set these environment variables permanently:"
echo "1. Add the following line to your ~/.bashrc or ~/.zshrc file:"
echo "   export DOTVACAY_OPENAI_APIKEY=\"$OPENAI_API_KEY\""
echo -e "\nOr use the .NET User Secrets for development:"
echo "dotnet user-secrets set \"OpenAI:ApiKey\" \"$OPENAI_API_KEY\""

# Launch the API project
echo -e "\nLaunching the API project..."
dotnet run --project DotVacay.API