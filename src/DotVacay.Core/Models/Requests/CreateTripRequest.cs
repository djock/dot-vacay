namespace DotVacay.Core.Models.Requests
{
    public record CreateTripRequest(string Title, string Description, DateTimeOffset? StartDate, DateTimeOffset? EndDate, double Latitude, double Longitude, string UserEmail);
}
