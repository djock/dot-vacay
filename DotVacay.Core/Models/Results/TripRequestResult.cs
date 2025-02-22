using DotVacay.Core.Entities;

namespace DotVacay.Core.Models.Results
{
    public record TripRequestResult(
        bool Success,
        Trip? Trip = null,
        IEnumerable<string>? Errors = null);
}
