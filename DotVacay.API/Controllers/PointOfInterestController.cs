using DotVacay.Application.DTOs;
using DotVacay.Core.Entities;
using DotVacay.Core.Enums;
using DotVacay.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DotVacay.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PointOfInterestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PointOfInterestController(ApplicationDbContext context)
        {
            _context = context;
        }

        #region POST

        [HttpPost("create")]
        public async Task<IActionResult> CreatePointOfInterest([FromBody] CreatePointOfInterestDto poiDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var trip = await _context.Trips
                .AsNoTracking()
                .Include(t => t.UserTrips)
                .FirstOrDefaultAsync(t => t.Id == poiDto.TripId);

            if (trip == null)
            {
                return NotFound("Trip not found");
            }

            if (!trip.UserTrips.Any(ut => ut.UserId == userId))
            {
                return Forbid("You don't have permission to modify this trip");
            }

            var pointOfInterest = new PointOfInterest
            {
                Title = poiDto.Title,
                Description = poiDto.Description,
                Url = poiDto.Url,
                Latitude = poiDto.Latitude,
                Longitude = poiDto.Longitude,
                Type = poiDto.Type,
                TripId = poiDto.TripId,
            };

            _context.PointsOfInterest.Add(pointOfInterest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPointOfInterest), new { id = pointOfInterest.Id }, pointOfInterest);
        }

        #endregion

        #region GET

        [HttpGet("getAll/{tripId}")]
        public async Task<IActionResult> GetAllPointsOfInterest(int tripId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            // Check if the user has access to the trip
            var trip = await _context.Trips
                .Include(t => t.UserTrips)
                .FirstOrDefaultAsync(t => t.Id == tripId);

            if (trip == null)
            {
                return NotFound("Trip not found");
            }

            if (!trip.UserTrips.Any(ut => ut.UserId == userId))
            {
                return Forbid("You don't have permission to view points of interest for this trip");
            }

            // Fetch all points of interest for the trip
            var pointsOfInterest = await _context.PointsOfInterest
                .Where(poi => poi.TripId == tripId)
                .ToListAsync();

            return Ok(pointsOfInterest);
        }


        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetPointOfInterest(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var pointOfInterest = await _context.PointsOfInterest
                .FirstOrDefaultAsync(poi => poi.Id == id);

            if (pointOfInterest == null)
            {
                return NotFound("Point of interest not found");
            }

            return Ok(pointOfInterest);
        }

        #endregion

        #region PATCH

        [HttpPatch("update/{id}/type")]
        public async Task<IActionResult> UpdatePointOfInterestType(int id, [FromBody] PointOfInterestType newType)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.Type = newType;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/title")]
        public async Task<IActionResult> UpdatePointOfInterestTitle(int id, [FromBody] string newTitle)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.Title = newTitle;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/description")]
        public async Task<IActionResult> UpdatePointOfInterestDescription(int id, [FromBody] string newDescription)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.Description = newDescription;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/url")]
        public async Task<IActionResult> UpdatePointOfInterestUrl(int id, [FromBody] string newUrl)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.Url = newUrl;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/coordinates")]
        public async Task<IActionResult> UpdatePointOfInterestCoordinates(int id, [FromBody] UpdateCoordinatesDto coordinates)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.Latitude = coordinates.Latitude;
            poi.Longitude = coordinates.Longitude;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/dates")]
        public async Task<IActionResult> UpdatePointOfInterestDates(int id, [FromBody] UpdateDatesDto dates)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.StartDate = dates.StartDate;
            poi.EndDate = dates.EndDate;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        [HttpPatch("update/{id}/tripDayIndex")]
        public async Task<IActionResult> UpdatePointOfInterestTripDayIndex(int id, [FromBody] int? newTripDayIndex)
        {
            var poi = await _context.PointsOfInterest.FindAsync(id);
            if (poi == null)
            {
                return NotFound("Point of interest not found");
            }

            if (!await UserHasAccessToTrip(poi.TripId))
            {
                return Forbid("You don't have permission to modify this point of interest");
            }

            poi.TripDayIndex = newTripDayIndex;
            await _context.SaveChangesAsync();

            return Ok(poi);
        }

        // Helper method to check if the current user has access to the trip
        private async Task<bool> UserHasAccessToTrip(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Trips.AnyAsync(t => t.Id == id && t.UserTrips.Any(ut => ut.UserId == userId));

        }

        #endregion

        #region DELETE

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePointOfInterest(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var pointOfInterest = await _context.PointsOfInterest
                .FirstOrDefaultAsync(poi => poi.Id == id);

            if (pointOfInterest == null)
            {
                return NotFound("Point of interest not found");
            }

            _context.PointsOfInterest.Remove(pointOfInterest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        #endregion
    }
}
