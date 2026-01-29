namespace DotVacay.Core.Entities
{
    public class TripListItem
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required int TripListId { get; set; }
        public bool IsChecked { get; set; } = false;
    }
}
