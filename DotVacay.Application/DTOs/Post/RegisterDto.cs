namespace DotVacay.Application.DTOs.Post
{
    public record RegisterDto
    (
         string FirstName,
         string LastName,
         string Email,
         string Password
    );
}
