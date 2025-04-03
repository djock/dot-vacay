using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripResult(
     bool Success,
     Trip? Trip,
     bool UserIsOwner,
     IEnumerable<string>? Errors = null);
}
