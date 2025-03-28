namespace DotVacay.Core.Models.Requests
{
    public record UpdateTripDayIndexRequest(int Id, int? NewTripDayIndex, string UserId);
}
