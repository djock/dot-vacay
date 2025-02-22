namespace DotVacay.Core.Models.Results
{
    public record AllTripsResult (
     bool Success,
     List<TripResult> Token,
     IEnumerable<string>? Errors = null);
}
