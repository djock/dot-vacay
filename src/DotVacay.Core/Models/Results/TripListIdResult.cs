namespace DotVacay.Core.Models.Results
{
    public record TripListIdResult(
        bool Success,
        int? TripListId,
        IEnumerable<string>? Errors = null);
}
