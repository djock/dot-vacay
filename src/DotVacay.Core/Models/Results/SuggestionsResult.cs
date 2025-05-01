using DotVacay.Core.Models.Suggestions;

namespace DotVacay.Core.Models.Results
{
    public record SuggestionsResult : RequestResult 
    {
        public List<PoiSuggestion> Suggestions { get; set; } = new List<PoiSuggestion>();

        public SuggestionsResult(bool success, List<string>? errors = null, List<PoiSuggestion>? suggestions = null) 
            : base(success, errors)
        {
            if (suggestions != null)
                Suggestions = suggestions;
        }
    }
}