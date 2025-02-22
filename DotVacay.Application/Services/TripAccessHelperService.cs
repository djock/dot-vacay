using DotVacay.Core.Common;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Application.Services
{
    public class TripAccessHelperService(ApplicationDbContext context) : ITripAccessHelperService
    {
        private readonly ApplicationDbContext _context = context;
       
        public async Task<TripRequestResult> GetTripWithAccessCheck(UserResourceIdRequest request)
        {
            var trip = await _context.Trips
                .Include(t => t.UserTrips)
                .FirstOrDefaultAsync(t => t.Id == request.ResourceId);

            if (trip == null) return new TripRequestResult(false, Errors: DomainErrors.General.NotFound.Errors);

            if (!trip.UserTrips.Any(ut => ut.UserId == request.UserId))
                return new TripRequestResult(false, Errors: DomainErrors.Trip.UserNotMember.Errors);

            return new TripRequestResult(true, trip);
        }
    }
}
