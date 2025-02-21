using DotVacay.Core.Common;
using DotVacay.Core.Entities;
using DotVacay.Core.Enums;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models;
using DotVacay.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Application.Services
{
    public class TripService(ApplicationDbContext context,
    UserManager<ApplicationUser> userManager) : ITripService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly UserManager<ApplicationUser> _userManager = userManager;

        public async Task<RequestResult> CreateAsync(CreateTripRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.UserEmail);
            if (user == null) return DomainErrors.Auth.UserNotFound;

            var trip = new Trip
            {
                Title = request.Title,
                Description = request.Description
            };

            var userTrip = new UserTrip
            {
                User = user,
                UserId = user.Id,
                Trip = trip,
                Role = UserTripRole.Owner
            };

            trip.UserTrips.Add(userTrip);
            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return new RequestResult(true, new { trip.Id, trip.Title, trip.Description });
        }

        public async Task<RequestResult> DeleteAsync(UserResourceIdRequest request)
        {
            var tripResult = await GetTripWithAccessCheck(request);
            if (!tripResult.Success || tripResult.Trip == null) return new RequestResult(false, Errors: tripResult.Errors);

            var isOwner = tripResult.Trip.UserTrips
                .Any(ut => ut.UserId == request.UserId && ut.Role == UserTripRole.Owner);

            if (!isOwner) return DomainErrors.General.CannotModify;

            _context.Trips.Remove(tripResult.Trip);
            await _context.SaveChangesAsync();
            return new RequestResult(true);
        }

        public async Task<RequestResult> GetAllAsync(string userId)
        {
            var user = await _context.Users
           .Include(u => u.UserTrips)
               .ThenInclude(ut => ut.Trip)
           .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return DomainErrors.General.Forbidden;

            var trips = user.UserTrips.Select(ut => new
            {
                ut.Trip.Id,
                ut.Trip.Title,
                ut.Trip.Description,
                ut.Trip.StartDate,
                ut.Trip.EndDate,
                ut.Role
            });

            return new RequestResult(true, trips);
        }

        public async Task<RequestResult> GetByIdAsync(UserResourceIdRequest request)
        {
            var trip = await _context.Trips
            .Include(t => t.UserTrips)
            .ThenInclude(ut => ut.User)
            .FirstOrDefaultAsync(t => t.Id == request.ResourceId);

            if (trip == null) return DomainErrors.General.NotFound;

            if (!trip.UserTrips.Any(ut => ut.UserId == request.UserId))
                return DomainErrors.Trip.UserNotMember;

            var userTrip = trip.UserTrips.First(ut => ut.UserId == request.UserId);
            return new RequestResult(true, new { trip.Id, trip.Title, trip.Description, userTrip.Role, trip.PointsOfInterest });
        }

        public async Task<RequestResult> JoinAsync(JoinTripRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.UserEmail);
            if (user == null) return DomainErrors.Auth.UserNotFound;

            var trip = await _context.Trips
                .Include(t => t.UserTrips)
                .FirstOrDefaultAsync(t => t.Id == request.TripId);

            if (trip == null) return DomainErrors.General.NotFound;

            if (trip.UserTrips.Any(ut => ut.UserId == user.Id))
                return DomainErrors.Trip.AlreadyMember;

            var userTrip = new UserTrip
            {
                User = user,
                UserId = user.Id,
                Trip = trip,
                Role = request.Role
            };

            trip.UserTrips.Add(userTrip);
            await _context.SaveChangesAsync();

            return new RequestResult(true, new { trip.Id, request.Role });
        }

        public async Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request)
        {
            var tripResult = await GetTripWithAccessCheck(new(request.Id, request.UserId));
            if (!tripResult.Success || tripResult.Trip == null) return new RequestResult(false, Errors: tripResult.Errors);

            tripResult.Trip.StartDate = request.StartDate;
            tripResult.Trip.EndDate = request.EndDate;

            await _context.SaveChangesAsync();
            return new RequestResult(true, new { tripResult.Trip.Id, tripResult.Trip.StartDate, tripResult.Trip.EndDate });
        }

        public async Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request)
        {
            var tripResult = await GetTripWithAccessCheck(new(request.Id, request.UserId));
            if (!tripResult.Success || tripResult.Trip == null) return new RequestResult(false, Errors: tripResult.Errors);

            tripResult.Trip.Description = request.NewText;
            await _context.SaveChangesAsync();
            return new RequestResult(true, new { tripResult.Trip.Id, tripResult.Trip.Description });
        }

        public async Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request)
        {
            var tripResult = await GetTripWithAccessCheck(new(request.Id, request.UserId));
            if (!tripResult.Success || tripResult.Trip == null) return new RequestResult(false, Errors: tripResult.Errors);

            tripResult.Trip.Title = request.NewText;
            await _context.SaveChangesAsync();
            return new RequestResult(true, new { tripResult.Trip.Id, tripResult.Trip.Title });
        }

        public async Task<TripResult> GetTripWithAccessCheck(UserResourceIdRequest request)
        {
            var trip = await _context.Trips
                .Include(t => t.UserTrips)
                .FirstOrDefaultAsync(t => t.Id == request.ResourceId);

            if (trip == null) return  new TripResult(false, Errors: DomainErrors.General.NotFound.Errors);

            if (!trip.UserTrips.Any(ut => ut.UserId == request.UserId))
                return new TripResult(false, Errors: DomainErrors.Trip.UserNotMember.Errors);

            return new TripResult(true, trip);
        }
    }
}
