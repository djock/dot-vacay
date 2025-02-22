namespace DotVacay.Core.Models.Results
{
    public record AllTripsResult (
     bool Success,
     List<TripResult> Trips,
     IEnumerable<string>? Errors = null);
}
