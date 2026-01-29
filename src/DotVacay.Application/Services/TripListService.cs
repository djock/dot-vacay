using DotVacay.Core.Common;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Application.Services
{
    public class TripListService(ITripListRepository tripListRepository, ITripAccessHelperService tripAccessHelperService) : ITripListService
    {
        public async Task<TripListIdResult> CreateAsync(CreateTripListRequest request)
        {
            var accessResult = await tripAccessHelperService.HasAccessToTrip(request.TripId, request.UserId);
            if (!accessResult)
            {
                return new(false, null, Errors: [DomainErrors.Trip.UserNotMember]);
            }

            var tripList = new TripList
            {
                Title = request.Title,
                TripId = request.TripId
            };

            await tripListRepository.AddAsync(tripList);

            return new(true, tripList.Id);
        }

        public async Task<TripListsResult> GetByTripIdAsync(UserResourceIdRequest request)
        {
            var accessResult = await tripAccessHelperService.HasAccessToTrip(request.ResourceId, request.UserId);
            if (!accessResult)
            {
                return new(false, null, Errors: [DomainErrors.Trip.UserNotMember]);
            }

            var tripLists = await tripListRepository.GetByTripIdAsync(request.ResourceId);

            return new(true, tripLists);
        }

        public async Task<RequestResult> DeleteAsync(UserResourceIdRequest request)
        {
            var tripList = await tripListRepository.GetByIdAsync(request.ResourceId);
            if (tripList == null)
            {
                return new(false, Errors: [DomainErrors.TripList.NotFound]);
            }

            var tripAccessResult = await tripAccessHelperService.GetTripWithAccessCheck(new(tripList.TripId, request.UserId));
            if (!tripAccessResult.Success || !tripAccessResult.UserIsOwner)
            {
                return new(false, Errors: [DomainErrors.Trip.NotOwner]);
            }

            await tripListRepository.RemoveAsync(tripList);

            return new(true);
        }
    }

    public class TripListItemService(ITripListItemRepository tripListItemRepository, ITripListRepository tripListRepository, ITripAccessHelperService tripAccessHelperService) : ITripListItemService
    {
        public async Task<TripListIdResult> CreateAsync(CreateTripListItemRequest request)
        {
            var tripList = await tripListRepository.GetByIdAsync(request.TripListId);
            if (tripList == null)
            {
                return new(false, null, Errors: [DomainErrors.TripList.NotFound]);
            }

            var accessResult = await tripAccessHelperService.HasAccessToTrip(tripList.TripId, request.UserId);
            if (!accessResult)
            {
                return new(false, null, Errors: [DomainErrors.Trip.UserNotMember]);
            }

            var tripListItem = new TripListItem
            {
                Title = request.Title,
                TripListId = request.TripListId,
                IsChecked = false
            };

            await tripListItemRepository.AddAsync(tripListItem);

            return new(true, tripList.Id);
        }

        public async Task<RequestResult> DeleteAsync(UserResourceIdRequest request)
        {
            var tripListItem = await tripListItemRepository.GetByIdAsync(request.ResourceId);
            if (tripListItem == null)
            {
                return new(false, Errors: [DomainErrors.TripList.TripListItemNotFound]);
            }

            var tripList = await tripListRepository.GetByIdAsync(tripListItem.TripListId);
            if (tripList == null)
            {
                return new(false, Errors: [DomainErrors.TripList.NotFound]);
            }

            var tripAccessResult = await tripAccessHelperService.GetTripWithAccessCheck(new(tripList.TripId, request.UserId));
            if (!tripAccessResult.Success)
            {
                return new(false, Errors: [DomainErrors.Trip.UserNotMember]);
            }

            await tripListItemRepository.RemoveAsync(tripListItem);

            return new(true);
        }

        public async Task<RequestResult> UpdateAsync(UpdateTripListItemRequest request)
        {
            var tripListItem = await tripListItemRepository.GetByIdAsync(request.Id);
            if (tripListItem == null)
            {
                return new(false, Errors: [DomainErrors.TripList.TripListItemNotFound]);
            }

            var tripList = await tripListRepository.GetByIdAsync(tripListItem.TripListId);
            if (tripList == null)
            {
                return new(false, Errors: [DomainErrors.TripList.NotFound]);
            }

            var tripAccessResult = await tripAccessHelperService.GetTripWithAccessCheck(new(tripList.TripId, request.UserId));
            if (!tripAccessResult.Success)
            {
                return new(false, Errors: [DomainErrors.Trip.UserNotMember]);
            }

            tripListItem.IsChecked = request.IsChecked;
            await tripListItemRepository.SaveChangesAsync();

            return new(true);
        }
    }
}
