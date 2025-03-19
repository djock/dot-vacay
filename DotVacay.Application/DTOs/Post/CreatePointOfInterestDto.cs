using DotVacay.Core.Enums;

namespace DotVacay.Application.DTOs.Post
{
    public record CreatePointOfInterestDto
    (
        int? Id,
        int TripId ,
        string Title ,
        PointOfInterestType Type ,
        string? Description ,
        string? Url ,
        double Latitude ,
        double Longitude ,
        DateTimeOffset? StartDate ,
        DateTimeOffset? EndDate ,
        int? TripDayIndex
    );
}
