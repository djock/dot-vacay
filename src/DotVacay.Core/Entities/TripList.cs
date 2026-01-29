namespace DotVacay.Core.Entities
{
    public class TripList
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required int TripId { get; set; }
        public ICollection<TripListItem> ListItems { get; set; } = [];
    }
}
