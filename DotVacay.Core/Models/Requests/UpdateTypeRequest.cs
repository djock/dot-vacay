using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Requests
{
    public record UpdateTypeRequest(int Id, PointOfInterestType NewType, string UserId);
}
