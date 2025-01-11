using DotVacay.Core.Entities;

namespace DotVacay.Core.DTOs
{
    public class CreatePointOfInterestDto
    {
        public required int TripId { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public required PointOfInterestType Type { get; set; }
    }
}
