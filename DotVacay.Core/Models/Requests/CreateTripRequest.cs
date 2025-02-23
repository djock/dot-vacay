namespace DotVacay.Core.Models.Requests
{
    public record CreateTripRequest(string Title, DateTimeOffset? StartDate, DateTimeOffset? EndDate, string UserEmail);
}
