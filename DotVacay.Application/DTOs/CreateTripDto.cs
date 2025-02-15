namespace DotVacay.Application.DTOs
{
    public record CreateTripDto
    (
        string Title,
        string? Description,
        DateTimeOffset? StartDate,
        DateTimeOffset? EndDate
    );
}
