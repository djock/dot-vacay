using DotVacay.Core.Entities;

namespace DotVacay.Core.Models
{
    public record TripResult(
        bool Success,
        Trip? Trip = null,
        IEnumerable<string>? Errors = null);
}
