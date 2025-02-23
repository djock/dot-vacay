using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces
{
    public interface ITripAccessHelperService
    {
        Task<TripResult> GetTripWithAccessCheck(UserResourceIdRequest userResourceIdRequest);
    }
}
