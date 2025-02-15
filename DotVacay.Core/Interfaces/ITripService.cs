using DotVacay.Core.Models;

namespace DotVacay.Core.Interfaces
{
    public interface ITripService
    {
        Task<RequestResult> CreateAsync(CreateTripRequest request);
        Task<RequestResult> DeleteAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> JoinAsync(JoinTripRequest request);
        Task<RequestResult> GetAllAsync(string userId);
        Task<RequestResult> GetByIdAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request);
        Task<TripResult> GetTripWithAccessCheck(UserResourceIdRequest userResourceIdRequest);
    }
}

