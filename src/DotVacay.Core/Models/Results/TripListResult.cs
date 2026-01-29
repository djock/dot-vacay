using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripListResult(
        bool Success,
        TripList? TripList,
        IEnumerable<string>? Errors = null);
}
