namespace DotVacay.Application.DTOs
{
    public class CreateTripDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
    }
}
