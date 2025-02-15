using DotVacay.Core.Enums;

namespace DotVacay.Application.DTOs
{
    public record CreatePointOfInterestDto
    (
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
