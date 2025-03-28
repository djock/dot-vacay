using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripResult(
     bool Success,
     Trip? Trip,
     IEnumerable<string>? Errors = null);
}
