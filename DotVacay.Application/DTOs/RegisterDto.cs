namespace DotVacay.Application.DTOs
{
    public record RegisterDto
    (
         string FirstName,
         string LastName,
         string Email,
         string Password
    );
}
