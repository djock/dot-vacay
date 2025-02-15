namespace DotVacay.Core.Models
{
    public record RequestResult(
        bool Success,
        object? Data = null,
        IEnumerable<string>? Errors = null);
}
