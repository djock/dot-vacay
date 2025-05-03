using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Results;
using DotVacay.Core.Models.Suggestions;
using DotVacay.Core.Enums;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using System.Text.Json;
using System.Text.Json.Serialization;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Core.Entities;
using DotVacay.Core.Common;
using Microsoft.AspNetCore.Identity;
using DotVacay.Core.Models.Requests;

namespace DotVacay.Application.Services
{
    public class AiSuggestionService : IAiSuggestionService
    {
        private readonly string _apiKey;
        private readonly ILogger<AiSuggestionService> _logger;
        private readonly IPointOfInterestRepository _poiRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public AiSuggestionService(
            ILogger<AiSuggestionService> logger,
            IPointOfInterestRepository poiRepository, UserManager<ApplicationUser> userManager)
        {
            _logger = logger;
            _poiRepository = poiRepository;
            _userManager = userManager;

            _apiKey = Environment.GetEnvironmentVariable("DOTVACAY_OPENAI_APIKEY") ?? string.Empty;

            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("OpenAI API key not found in environment variables or configuration");
                throw new InvalidOperationException("OpenAI API key not found. Please set the DOTVACAY_OPENAI_APIKEY environment variable or add it to configuration.");
            }
        }

        public async Task<SuggestionsResult> GenerateTripSuggestionsAsync(GenerateTripSuggestionRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.UserEmail); 
            if (user == null) return new SuggestionsResult(false, errors: [DomainErrors.Auth.UserNotFound], suggestions: []);

            try
            {
                _logger.LogInformation($"Generating suggestions for {request.Location} from {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}");
                
                // Create OpenAI client
                var client = new ChatClient(model: "gpt-4.1-mini", apiKey: _apiKey);

                // Create the prompt
                int days = (request.EndDate - request.StartDate).Days + 1;

                var messages = new List<ChatMessage> { 
                    new SystemChatMessage(
                        "You are an expert travel planning assistant. Your task is to generate a detailed, realistic itinerary for a trip, focusing on points of interest. " +
                        "All suggestions should be accurate, up-to-date, and practical. Format your response as a single valid JSON array only, without any extra text or explanations. " +
                        "IMPORTANT: All times should be in the local timezone of the destination location."
                    ),
                    new UserChatMessage(
                        $"Create an itinerary for a {days}-day trip to {request.Location}, from {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}. " +
                        "Include a balanced mix of attractions, restaurants, coffee shops, museums, landmarks, and shopping venues. " +
                        "Do NOT include accommodations or transportation options. " +
                        "For each point of interest, provide the following fields:\n" +
                        "- title (string): Name of the place\n" +
                        "- description (string): Brief, accurate summary\n" +
                        "- type (string): One of 'Restaurant', 'Coffee', 'Museum', 'Landmark', or 'Shopping'\n" +
                        "- startDate (string): ISO 8601 date-time (e.g., 2025-05-30T09:00:00) within the trip period, including hour in LOCAL TIME of the destination\n" +
                        "- endDate (string): ISO 8601 date-time within the trip period, including hour in LOCAL TIME of the destination\n" +
                        "- url (string, optional): Official website or relevant link\n" +
                        "- latitude (number, optional): Decimal latitude\n" +
                        "- longitude (number, optional): Decimal longitude\n\n" +
                        "Requirements:\n" +
                        "1. All dates and times must be within the trip period and ordered chronologically from morning to evening each day.\n" +
                        "2. The time spent at each location should be realistic (e.g., 1-2 hours for a museum, 1 hour for a meal, etc.).\n" +
                        "3. Suggestions should be geographically logical (avoid unnecessary travel across the city between consecutive points).\n" +
                        "4. Return ONLY a valid JSON array of objects with the specified fields. Do NOT include any narrative, explanation, or formatting outside the array.\n" +
                        "5. Make sure the suggestions do not exceed the time box, into the second day.\n" +
                        "6. Make sure the suggestions for eating are also within the recommended time period for the local customs.\n" +
                        "7. Make sure the museums / attractions / landmarks suggestions are not outside of their working hours.\n" +
                        "8. IMPORTANT: All times should be in the local timezone of {request.Location}, not UTC."
                    )
                };


                // Get completion
                var chatCompletion = await client.CompleteChatAsync(messages);

                if (chatCompletion != null)
                {
                    var responseText = chatCompletion.Value.Content[0].Text;
                    _logger.LogInformation($"Received response from OpenAI: {responseText.Substring(0, Math.Min(100, responseText.Length))}...");

                    if (!string.IsNullOrEmpty(responseText))
                    {
                        string jsonContent = ExtractJsonFromText(responseText);
                        _logger.LogInformation($"Extracted JSON: {jsonContent.Substring(0, Math.Min(100, jsonContent.Length))}...");

                        try
                        {
                            // Parse the JSON into our model
                            List<PoiSuggestion>? suggestions = JsonSerializer.Deserialize<List<PoiSuggestion>>(jsonContent,
                                new JsonSerializerOptions
                                { 
                                    PropertyNameCaseInsensitive = true,
                                    Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
                                });

                            if (suggestions == null || !suggestions.Any())
                            {
                                _logger.LogWarning("No suggestions were parsed from the JSON response");
                                return new SuggestionsResult(false, new List<string> { "Failed to generate suggestions" });
                            }

                            // Map string type values to enum and save to database
                            var pointsOfInterest = new List<PointOfInterest>();
                            foreach (var suggestion in suggestions)
                            {
                                if (Enum.TryParse<PointOfInterestType>(suggestion.Type, true, out var poiType))
                                {
                                    suggestion.TypeEnum = poiType;
                                }
                                else
                                {
                                    _logger.LogWarning($"Unknown POI type: {suggestion.Type}");
                                    // Default to Landmark if type is unknown
                                    suggestion.TypeEnum = PointOfInterestType.Landmark;
                                }

                                // Create a PointOfInterest entity from the suggestion
                                var poi = new PointOfInterest
                                {
                                    Title = suggestion.Title,
                                    Description = suggestion.Description,
                                    Type = suggestion.TypeEnum,
                                    StartDate = suggestion.StartDate,
                                    EndDate = suggestion.EndDate,
                                    Url = suggestion.Url ?? string.Empty,
                                    Latitude = suggestion.Latitude ?? 0,
                                    Longitude = suggestion.Longitude ?? 0,
                                    TripId = int.Parse(request.TripId),
                                };

                                pointsOfInterest.Add(poi);
                            }

                            // Save all points of interest in a single database operation
                            if (pointsOfInterest.Any())
                            {
                                await _poiRepository.AddRangeAsync(pointsOfInterest);
                                _logger.LogInformation($"Saved {pointsOfInterest.Count} points of interest to the database");
                            }

                            return new SuggestionsResult(true, null, suggestions);
                        }
                        catch (JsonException ex)
                        {
                            _logger.LogError(ex, "Error deserializing JSON response");
                            return new SuggestionsResult(false, new List<string> { $"Error parsing suggestions: {ex.Message}" });
                        }
                    }
                }
                
                return new SuggestionsResult(false, new List<string> { "Failed to get a valid response from OpenAI" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating suggestions");
                return new SuggestionsResult(false, new List<string> { $"Error generating suggestions: {ex.Message}" });
            }
        }

        private string ExtractJsonFromText(string text)
        {
            // Find content between first [ and last ] for array
            int startArray = text.IndexOf('[');
            int endArray = text.LastIndexOf(']');
            
            if (startArray >= 0 && endArray >= 0 && endArray > startArray)
            {
                return text.Substring(startArray, endArray - startArray + 1);
            }
            
            // Try to find content between first { and last } for object
            int startObject = text.IndexOf('{');
            int endObject = text.LastIndexOf('}');
            
            if (startObject >= 0 && endObject >= 0 && endObject > startObject)
            {
                return text.Substring(startObject, endObject - startObject + 1);
            }
            
            // If we can't find JSON markers, return the original text
            return text;
        }
    }

}


