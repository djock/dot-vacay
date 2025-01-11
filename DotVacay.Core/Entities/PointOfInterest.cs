namespace DotVacay.Core.Entities
{
    public class PointOfInterest
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public PointOfInterestType Type { get; set; }
        public int TripId { get; set; }
        public required Trip Trip { get; set; }
    }
}
