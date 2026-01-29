using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces.Services
{
    public interface ITripListService
    {
        Task<TripListIdResult> CreateAsync(CreateTripListRequest request);
        Task<TripListsResult> GetByTripIdAsync(UserResourceIdRequest request);
        Task<RequestResult> DeleteAsync(UserResourceIdRequest request);
    }

    public interface ITripListItemService
    {
        Task<TripListIdResult> CreateAsync(CreateTripListItemRequest request);
        Task<RequestResult> DeleteAsync(UserResourceIdRequest request);
        Task<RequestResult> UpdateAsync(UpdateTripListItemRequest request);
    }
}
