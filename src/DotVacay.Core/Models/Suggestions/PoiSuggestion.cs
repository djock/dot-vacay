using System;
using System.Text.Json.Serialization;
using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Suggestions
{
    public class PoiSuggestion
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        
        // This will hold the string value from the API response
        public string Type { get; set; } = string.Empty;
        
        // This will be the parsed enum value
        [JsonIgnore]
        public PointOfInterestType TypeEnum { get; set; } = PointOfInterestType.Accomodation;
        
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public string? Url { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}
