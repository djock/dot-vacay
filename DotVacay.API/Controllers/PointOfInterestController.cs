using DotVacay.Core.DTOs;
using DotVacay.Core.Entities;
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


        [HttpDelete("{id}")]
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
    }
}
