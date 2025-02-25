using DotVacay.Core.Common;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Application.Services
{
    public class TripAccessHelperService(ITripRepository tripRepository) : ITripAccessHelperService
    {
        public async Task<TripResult> GetTripWithAccessCheck(UserResourceIdRequest request)
        {
            var trip = await tripRepository.GetByIdAsync(request.ResourceId);

            if (trip == null) return new TripResult(false, null, Errors: [DomainErrors.General.NotFound]);

            if (!trip.UserTrips.Any(ut => ut.UserId == request.UserId))
                return new TripResult(false, null, Errors: [DomainErrors.Trip.UserNotMember]);

            return new TripResult(true, trip);
        }

        public async Task<bool> HasAccessToTrip(int tripId, string userId)
        {
            var trip = await GetTripWithAccessCheck(new(tripId, userId));

            return trip.Success;
        }
    }
}
