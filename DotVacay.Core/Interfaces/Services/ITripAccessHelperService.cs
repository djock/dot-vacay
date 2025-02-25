using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces.Services
{
    public interface ITripAccessHelperService
    {
        Task<TripResult> GetTripWithAccessCheck(UserResourceIdRequest userResourceIdRequest);

        Task<bool> HasAccessToTrip(int tripId, string userId);
    }
}
