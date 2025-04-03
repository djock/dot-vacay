namespace DotVacay.Core.Models.Results
{
    public record RequestResult(
        bool Success,
        object? Data = null,
        IEnumerable<string>? Errors = null);
}
