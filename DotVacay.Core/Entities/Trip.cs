namespace DotVacay.Core.Entities
{
    public class Trip
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public ICollection<UserTrip> UserTrips { get; set; } = [];
        public ICollection<PointOfInterest>? PointsOfInterest { get; set; }
    }

}
