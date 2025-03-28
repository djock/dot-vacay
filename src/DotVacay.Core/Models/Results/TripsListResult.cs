using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripsListResult (
     bool Success,
     List<Trip> Trips,
     IEnumerable<string>? Errors = null);
}
