using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces.Services
{
    public interface IAiSuggestionService
    {
        Task<SuggestionsResult> GenerateTripSuggestionsAsync(GenerateTripSuggestionRequest request);
    }
}

