namespace DotVacay.Core.Models
{
    public record RegisterRequest(
       string Email,
       string Password,
       string FirstName,
       string LastName
   );
    public record LoginRequest(string Email, string Password);
}
