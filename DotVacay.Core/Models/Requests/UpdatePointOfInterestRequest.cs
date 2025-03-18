using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Requests
{
    public record UpdatePointOfInterestRequest(
       int PoiId,
       string UserId,
       string Title,
       string Description,
       string Url,
       double Latitude,
       double Longitude,
       PointOfInterestType Type,
       int TripId,
       DateTimeOffset? StartDate,
       DateTimeOffset? EndDate
    );
}
