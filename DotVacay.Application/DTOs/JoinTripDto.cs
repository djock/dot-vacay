using DotVacay.Core.Enums;

namespace DotVacay.Application.DTOs
{
    public class JoinTripDto
    {
        public int TripId { get; set; }
        public UserTripRole Role { get; set; }
    }
}
