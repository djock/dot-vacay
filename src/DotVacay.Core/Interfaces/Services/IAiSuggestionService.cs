using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces.Services
{
    public interface IAiSuggestionService
    {
        Task<SuggestionsResult> GenerateTripSuggestionsAsync(string location, DateTime startDate, DateTime endDate, string tripType);
    }
}