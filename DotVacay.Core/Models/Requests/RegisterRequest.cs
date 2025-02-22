namespace DotVacay.Core.Models.Requests
{
    public record RegisterRequest(
       string Email,
       string Password,
       string FirstName,
       string LastName
   );
}
