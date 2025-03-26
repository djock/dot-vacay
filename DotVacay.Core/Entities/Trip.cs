using DotVacay.Core.Enums;

namespace DotVacay.Core.Entities
{
    public class Trip
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public ICollection<UserTrip> UserTrips { get; set; } = [];
        public ICollection<PointOfInterest>? PointsOfInterest { get; set; }
    }
}
