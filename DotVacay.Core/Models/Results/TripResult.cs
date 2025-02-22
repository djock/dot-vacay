using DotVacay.Core.Enums;

namespace DotVacay.Core.Models.Results
{
    public record TripResult
    (
        int Id, 
        string Title, 
        DateTimeOffset? StartDate, 
        DateTimeOffset? EndDate,
        UserTripRole Role
    );
}
