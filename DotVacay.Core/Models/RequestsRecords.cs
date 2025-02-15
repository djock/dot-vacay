using DotVacay.Core.Enums;

namespace DotVacay.Core.Models
{
    public record CreatePointOfInterestRequest(
      string UserId,
      string Title,
      string Description,
      string Url,
      double Latitude,
      double Longitude,
      PointOfInterestType Type,
      int TripId);

    public record UpdateTypeRequest(int Id, PointOfInterestType NewType, string UserId);
    public record UpdateTextRequest(int Id, String NewText, string UserId);
    public record UpdateCoordinatesRequest(int Id, double Latitude, double Longitude, string UserId);
    public record UpdateDatesRequest(int Id, DateTimeOffset? StartDate, DateTimeOffset? EndDate, string UserId);
    public record UpdateTripDayIndexRequest(int Id, int? NewTripDayIndex, string UserId);
    public record CreateTripRequest(string Title, string Description, string UserEmail);
    public record JoinTripRequest(int TripId, UserTripRole Role, string UserEmail);
    public record UserResourceIdRequest(int ResourceId, string UserId);

}
