namespace DotVacay.Core.Models.Requests
{
    public class GenerateTripSuggestionRequest
    {

        public GenerateTripSuggestionRequest(string location, DateTime startDate, DateTime endDate,  string tripId, string userId, string userEmail)
        {
            Location = location;
            StartDate = startDate;
            EndDate = endDate;
            UserId = userId;
            TripId = tripId;
            UserEmail = userEmail;
        }

        public string Location { get; }
        public DateTime StartDate { get; }
        public DateTime EndDate { get; }
        public string UserId { get; }
        public string TripId { get; }
        public string UserEmail { get; }
    }
}
