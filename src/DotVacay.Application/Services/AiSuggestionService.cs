using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Results;
using OpenAI.Chat;
using Microsoft.Extensions.Logging;

namespace DotVacay.Application.Services
{
    public class AiSuggestionService : IAiSuggestionService
    {
        private readonly string _apiKey;
        private readonly ILogger<AiSuggestionService> _logger;

        public AiSuggestionService( ILogger<AiSuggestionService> logger)
        {
            _logger = logger;

            // Try to get API key from environment variable first, then fall back to configuration
            _apiKey = Environment.GetEnvironmentVariable("DOTVACAY_OPENAI_APIKEY");
            
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("OpenAI API key not found in environment variables or configuration");
                throw new InvalidOperationException("OpenAI API key not found. Please set the DOTVACAY_OPENAI_APIKEY environment variable or add it to configuration.");
            }
        }

        public async Task<SuggestionsResult> GenerateTripSuggestionsAsync(string location, DateTime startDate, DateTime endDate, string tripType)
        {
            try
            {
                _logger.LogInformation($"Generating suggestions for {location} from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");
                
                // Create OpenAI client
                var client = new ChatClient(model: "gpt-4.1-mini", apiKey: _apiKey);

                // Create the prompt
                int days = (endDate - startDate).Days + 1;
                
                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("You are a travel planning assistant. Generate a list of points of interest for a trip. Provide realistic suggestions with accurate details. Format your response as JSON."),
                    new UserChatMessage($"Create an itinerary for a {days}-day {tripType} trip to {location} from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}. " +
                                                   $"Include a mix of attractions, restaurants, and accommodations. " +
                                                   $"For each point of interest, provide: title, description, type (must be one of: Accommodation, Food, CarRental, or Attraction), " +
                                                   $"start date/time, end date/time, and URL if applicable. " +
                                                   $"Return ONLY valid JSON array that can be parsed, with each item having these properties: " +
                                                   $"title (string), description (string), type (string), startDate (ISO date string), endDate (ISO date string), " +
                                                   $"url (string, optional), latitude (number, optional), longitude (number, optional). " +
                                                   $"Ensure all dates are within the trip period.")
                };

                // Get completion
                var chatCompletion = await client.CompleteChatAsync(messages);

                if (chatCompletion != null)
                {

                    Console.WriteLine("chatCompletion " + chatCompletion.Value.Content[0].Text);

                    //if (!string.IsNullOrEmpty(chatCompletion))
                    //{
                    //    string jsonContent = ExtractJsonFromText(chatCompletion);

                    //    // Parse the JSON into our model
                    //    var suggestions = JsonSerializer.Deserialize<List<PoiSuggestion>>(jsonContent,
                    //        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    //    if (suggestions == null || !suggestions.Any())
                    //    {
                    //        return new SuggestionsResult(false, new List<string> { "Failed to generate suggestions" });
                    //    }

                    //    return new SuggestionsResult(true, null, suggestions);
                    //}
                }
                
                return new SuggestionsResult(false, new List<string> { "Failed to get a valid response from OpenAI" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Response received from OpenAI : {ex}");

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





