namespace DotVacay.Core.Models.Requests
{
    public record UpdateDatesRequest(int Id, DateTimeOffset? StartDate, DateTimeOffset? EndDate, string UserId);
}
