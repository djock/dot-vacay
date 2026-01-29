namespace DotVacay.Core.Models.Requests
{
    public record UpdateTripListItemRequest(int Id, bool IsChecked, string UserId, int TripId);
}
