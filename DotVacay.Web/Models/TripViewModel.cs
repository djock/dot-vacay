using DotVacay.Core.Entities;
using DotVacay.Core.Enums;

namespace DotVacay.Web.Models
{
    public class TripViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public ICollection<PointOfInterestViewModel> PointsOfInterest { get; set; } = [];
        public CreatePointOfInterestViewModel CreatePointOfInterest { get; set; } = new();
        public bool IsOwner { get; set; }

        public static TripViewModel FromTrip(Trip trip)
        {
            return new TripViewModel
            {
                Id = trip.Id,
                Title = trip.Title,
                Description = trip.Description,
                StartDate = trip.StartDate,
                EndDate = trip.EndDate,
                PointsOfInterest = trip.PointsOfInterest?.Select(poi => new PointOfInterestViewModel
                {
                    PoiId = poi.Id,
                    TripId = trip.Id,
                    Title = poi.Title,
                    Type = poi.Type,
                    Description = poi.Description,
                    Url = poi.Url,
                    StartDate = poi.StartDate,
                    EndDate = poi.EndDate,
                    TripDayIndex = poi.TripDayIndex
                }).ToList() ?? [],
                CreatePointOfInterest = new CreatePointOfInterestViewModel
                {
                    TripId = trip.Id
                },
                IsOwner = trip.UserTrips.FirstOrDefault(ut => ut.TripId == trip.Id)?.Role == UserTripRole.Owner
            };
        }
    }
} 