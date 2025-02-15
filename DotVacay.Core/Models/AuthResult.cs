namespace DotVacay.Core.Models
{
    public record AuthResult(bool Success, string? Token = null, IEnumerable<string>? Errors = null);
}
