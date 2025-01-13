using DotVacay.Core.Entities;

namespace DotVacay.Core.DTOs
{
    public class JoinTripDto
    {
        public int TripId { get; set; }
        public UserTripRole Role { get; set; }
    }
}
