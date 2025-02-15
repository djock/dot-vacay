using DotVacay.Core.Common;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Application.Services
{
    public class PointOfInterestService(ApplicationDbContext context, ITripService tripService) : IPointOfInterestService
    {
        private readonly ApplicationDbContext _context = context;
        private readonly ITripService _tripService = tripService;

        public async Task<RequestResult> CreateAsync(CreatePointOfInterestRequest request)
        {
            var trip = await _tripService.GetTripWithAccessCheck(new(request.TripId, request.UserId));

            var poi = new PointOfInterest
            {
                Title = request.Title,
                Description = request.Description,
                Url = request.Url,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Type = request.Type,
                TripId = request.TripId
            };

            _context.PointsOfInterest.Add(poi);
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> DeleteAsync(UserResourceIdRequest request)
        {
            var pointOfInterest = await _context.PointsOfInterest
                .FirstOrDefaultAsync(poi => poi.Id == request.ResourceId);

            if (pointOfInterest == null)
            {
                return DomainErrors.General.NotFound;
            }

            _context.PointsOfInterest.Remove(pointOfInterest);
            await _context.SaveChangesAsync();

            return new RequestResult(true, null);
        }

        public async Task<RequestResult> GetAllAsync(UserResourceIdRequest request)
        {
            var trip = await _tripService.GetTripWithAccessCheck(request);

            var pois = await _context.PointsOfInterest
                .Where(p => p.TripId == request.ResourceId)
                .ToListAsync();

            return new RequestResult(true, pois);
        }

        public async Task<RequestResult> GetByIdAsync(UserResourceIdRequest request)
        {
            var trip = await _tripService.GetTripWithAccessCheck(request);

            var pointOfInterest = await _context.PointsOfInterest
                .FirstOrDefaultAsync(p => p.TripId == request.ResourceId);

            if (pointOfInterest == null)
            {
                return DomainErrors.General.NotFound;
            }

            return new RequestResult(true, pointOfInterest);
        }

        public async Task<RequestResult> UpdateCoordinatesAsync(UpdateCoordinatesRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return DomainErrors.General.NotFound;
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new RequestResult(false, Errors: ["Forbidden"]);
            }

            poi.Longitude = request.Longitude;
            poi.Latitude = request.Latitude;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return DomainErrors.General.NotFound;
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new RequestResult(false, Errors: ["Forbidden"]);
            }

            poi.StartDate = request.StartDate;
            poi.EndDate = request.EndDate;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return DomainErrors.General.NotFound;
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return DomainErrors.General.Forbidden;
            }

            poi.Description = request.NewText;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return DomainErrors.General.NotFound;
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return DomainErrors.General.Forbidden;
            }

            poi.Title = request.NewText;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTripDayIndexAsync(UpdateTripDayIndexRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return DomainErrors.General.NotFound;
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return DomainErrors.General.Forbidden;
            }

            poi.TripDayIndex = request.NewTripDayIndex;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTypeAsync(UpdateTypeRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
                return DomainErrors.General.NotFound;

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
                return DomainErrors.General.Forbidden;

            poi.Type = request.NewType;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateUrlAsync(UpdateTextRequest request)
        {
            var poi = await _context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
                return DomainErrors.General.NotFound;

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
                return DomainErrors.General.Forbidden;

            poi.Url = request.NewText;
            await _context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        private async Task<bool> HasAccessToTrip(int tripId, string userId)
        {
            return await _context.Trips
                .AnyAsync(t => t.Id == tripId &&
                    t.UserTrips.Any(ut => ut.UserId == userId));
        }
    }
}
