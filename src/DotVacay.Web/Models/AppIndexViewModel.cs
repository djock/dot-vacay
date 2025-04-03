namespace DotVacay.Web.Models
{
    public class AppIndexViewModel
    {
        public List<TripListItemViewModel> Trips { get; set; } = [];
        public CreateTripViewModel CreateTrip { get; set; } = new() { Title = string.Empty };
    }
} 