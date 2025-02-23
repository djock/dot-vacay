using DotVacay.Core.Common;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Application.Services
{
    public class PointOfInterestService(ApplicationDbContext context, ITripAccessHelperService tripAccessHelperService) : IPointOfInterestService
    {

        public async Task<RequestResult> CreateAsync(CreatePointOfInterestRequest request)
        {
            var trip = await tripAccessHelperService.GetTripWithAccessCheck(new(request.TripId, request.UserId));

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

            context.PointsOfInterest.Add(poi);
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> DeleteAsync(UserResourceIdRequest request)
        {
            var pointOfInterest = await context.PointsOfInterest
                .FirstOrDefaultAsync(poi => poi.Id == request.ResourceId);

            if (pointOfInterest == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            context.PointsOfInterest.Remove(pointOfInterest);
            await context.SaveChangesAsync();

            return new RequestResult(true, null);
        }

        public async Task<RequestResult> GetAllAsync(UserResourceIdRequest request)
        {
            var trip = await tripAccessHelperService.GetTripWithAccessCheck(request);

            var pois = await context.PointsOfInterest
                .Where(p => p.TripId == request.ResourceId)
                .ToListAsync();

            return new RequestResult(true, pois);
        }

        public async Task<RequestResult> GetByIdAsync(UserResourceIdRequest request)
        {
            var trip = await tripAccessHelperService.GetTripWithAccessCheck(request);

            var pointOfInterest = await context.PointsOfInterest
                .FirstOrDefaultAsync(p => p.TripId == request.ResourceId);

            if (pointOfInterest == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            return new RequestResult(true, pointOfInterest);
        }

        public async Task<RequestResult> UpdateCoordinatesAsync(UpdateCoordinatesRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new RequestResult(false, Errors: ["Forbidden"]);
            }

            poi.Longitude = request.Longitude;
            poi.Latitude = request.Latitude;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateDatesAsync(UpdateDatesRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new(false, DomainErrors.General.Forbidden);
            }

            poi.StartDate = request.StartDate;
            poi.EndDate = request.EndDate;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateDescriptionAsync(UpdateTextRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new(false, DomainErrors.General.Forbidden);
            }

            poi.Description = request.NewText;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTitleAsync(UpdateTextRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new(false, DomainErrors.General.Forbidden);
            }

            poi.Title = request.NewText;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTripDayIndexAsync(UpdateTripDayIndexRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
            {
                return new(false, DomainErrors.General.NotFound);
            }

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
            {
                return new(false, DomainErrors.General.Forbidden);
            }

            poi.TripDayIndex = request.NewTripDayIndex;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateTypeAsync(UpdateTypeRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
                return new(false, DomainErrors.General.NotFound);

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
                return new(false, DomainErrors.General.Forbidden);

            poi.Type = request.NewType;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        public async Task<RequestResult> UpdateUrlAsync(UpdateTextRequest request)
        {
            var poi = await context.PointsOfInterest.FindAsync(request.Id);
            if (poi == null)
                return new(false, DomainErrors.General.NotFound);

            if (!await HasAccessToTrip(poi.TripId, request.UserId))
                return new(false, DomainErrors.General.Forbidden);

            poi.Url = request.NewText;
            await context.SaveChangesAsync();

            return new RequestResult(true, poi);
        }

        private async Task<bool> HasAccessToTrip(int tripId, string userId)
        {
            return await context.Trips
                .AnyAsync(t => t.Id == tripId &&
                    t.UserTrips.Any(ut => ut.UserId == userId));
        }
    }
}
