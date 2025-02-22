using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces
{
    public interface ITripService
    {
        Task<TripIdResult> CreateAsync(CreateTripRequest request);
        Task<RequestResult> DeleteAsync(UserResourceIdRequest userResourceIdRequest);
        Task<TripIdResult> JoinAsync(JoinTripRequest request);
        Task<AllTripsResult> GetAllAsync(string userId);
        Task<RequestResult> GetByIdAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request);
        Task<TripRequestResult> GetTripWithAccessCheck(UserResourceIdRequest userResourceIdRequest);
    }
}

