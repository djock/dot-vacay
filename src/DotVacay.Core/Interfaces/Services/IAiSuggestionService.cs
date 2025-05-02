using DotVacay.Core.Models.Results;
using System;
using System.Threading.Tasks;

namespace DotVacay.Core.Interfaces.Services
{
    public interface IAiSuggestionService
    {
        Task<SuggestionsResult> GenerateTripSuggestionsAsync(string location, DateTime startDate, DateTime endDate);
    }
}

