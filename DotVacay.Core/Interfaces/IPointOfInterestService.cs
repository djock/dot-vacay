using DotVacay.Core.Models;

namespace DotVacay.Core.Interfaces
{
    public interface IPointOfInterestService
    {
        Task<RequestResult> CreateAsync(CreatePointOfInterestRequest request);
        Task<RequestResult> DeleteAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> GetAllAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> GetByIdAsync(UserResourceIdRequest userResourceIdRequest);
        Task<RequestResult> UpdateTypeAsync(UpdateTypeRequest request);
        Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateUrlAsync(UpdateTextRequest request);
        Task<RequestResult> UpdateCoordinatesAsync(UpdateCoordinatesRequest request);
        Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request);
        Task<RequestResult> UpdateTripDayIndexAsync(UpdateTripDayIndexRequest request);

    }
}
