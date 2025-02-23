using DotVacay.Core.Enums;

namespace DotVacay.Core.Entities
{
    public class UserTrip
    {
        public required string UserId { get; set; }
        public required ApplicationUser User { get; set; }
        public int TripId { get; set; }
        public required Trip Trip { get; set; }
        public UserTripRole Role { get; set; }

    }
}
