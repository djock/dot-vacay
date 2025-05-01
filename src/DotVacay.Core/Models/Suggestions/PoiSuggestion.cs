using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Suggestions
{
    public class PoiSuggestion
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PointOfInterestType Type { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Url { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}