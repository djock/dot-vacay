namespace DotVacay.Core.Models.Results
{
    public record AuthResult(
       bool Success,
       string Token,
       IEnumerable<string>? Errors = null);
}
