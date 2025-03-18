using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Dtos
{
    public class CreatePointOfInterestDto
    {
        public int? Id { get; set; }
        public int TripId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PointOfInterestType Type { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public string? Url { get; set; }
        public string? Address { get; set; }
    }
} 