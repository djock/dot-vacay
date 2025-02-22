using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Requests
{
    public record JoinTripRequest(int TripId, UserTripRole Role, string UserEmail);
}
