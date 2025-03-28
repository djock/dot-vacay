using DotVacay.Core.Enums;

namespace DotVacay.Core.Entities
{
    public class PointOfInterest
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required int TripId { get; set; }
        public required PointOfInterestType Type { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public int? TripDayIndex { get; set; }
    }
}
