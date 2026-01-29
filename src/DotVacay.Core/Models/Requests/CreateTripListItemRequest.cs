namespace DotVacay.Core.Models.Requests
{
    public record CreateTripListItemRequest(int TripListId, string Title, string UserId);
}
