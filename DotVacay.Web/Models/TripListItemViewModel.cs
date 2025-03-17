using DotVacay.Core.Entities;
using DotVacay.Core.Enums;

namespace DotVacay.Web.Models
{
    public class TripListItemViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public int PointsOfInterestCount { get; set; }
        public bool IsOwner { get; set; }

        public static TripListItemViewModel FromTrip(Trip trip, string currentUserId)
        {
            foreach(var item in trip.UserTrips)
            {
                Console.WriteLine(item.TripId + " " + item.Role);
            }

            Console.WriteLine(trip.Id.ToString() );


            return new TripListItemViewModel
            {
                Id = trip.Id,
                Title = trip.Title,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                PointsOfInterestCount = trip.PointsOfInterest?.Count ?? 0,
                IsOwner = trip.UserTrips.FirstOrDefault(ut => ut.TripId == trip.Id)?.Role == UserTripRole.Owner
            };
        }
    }
} 