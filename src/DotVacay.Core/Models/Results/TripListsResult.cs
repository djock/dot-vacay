using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripListsResult(
        bool Success,
        IEnumerable<TripList>? TripLists,
        IEnumerable<string>? Errors = null);
}
