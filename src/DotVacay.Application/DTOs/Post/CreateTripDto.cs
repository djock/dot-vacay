namespace DotVacay.Application.DTOs.Post
{
    public record CreateTripDto
    (
        string Title,
        string? Description,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate,
        double Latitude,
        double Longitude
    );
}
