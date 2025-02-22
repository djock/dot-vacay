namespace DotVacay.Core.Models.Results
{
    public record TripIdResult(
       bool Success,
       int? TripId,
       IEnumerable<string>? Errors = null);
}
