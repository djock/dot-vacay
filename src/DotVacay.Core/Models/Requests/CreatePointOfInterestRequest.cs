using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Requests
{
    public record CreatePointOfInterestRequest(
        string UserId,
        string Title,
        string Description,
        string Url,
        double Latitude,
        double Longitude,
        PointOfInterestType Type,
        int TripId, 
        DateTimeOffset? StartDate, 
        DateTimeOffset? EndDate,
        int PoiId
     );
}
