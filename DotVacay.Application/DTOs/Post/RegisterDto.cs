namespace DotVacay.Application.DTOs.Post
{
    public record RegisterDto
    (
         string Email,
         string Password,
         string FirstName,
         string LastName
    );
}
