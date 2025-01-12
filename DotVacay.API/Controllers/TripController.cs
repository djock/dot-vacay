using DotVacay.Core.DTOs;
using DotVacay.Core.Entities;
using DotVacay.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Diagnostics;
using System.Security.Claims;

namespace DotVacay.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TripController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public TripController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        #region POST

        [HttpPost("create")]
        public async Task<IActionResult> CreateTrip([FromBody] CreateTripDto createTripDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userEmail = User.FindFirstValue(ClaimTypes.Email);

            var user = await _userManager.FindByEmailAsync(userEmail);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            var trip = new Trip
            {
                Title = createTripDto.Title,
                Description = createTripDto.Description
            };

            var userTrip = new UserTrip
            {
                UserId = user.Id,
                User = user,
                Trip = trip,
                Role = UserTripRole.Owner
            };

            trip.UserTrips.Add(userTrip);

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTrip), new { id = trip.Id }, new { TripId = trip.Id, trip.Title, trip.Description });
        }

        #endregion

        #region GET

        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllTrips()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            Console.WriteLine("UserId " + userId);


            var userWithTrips = await _context.Users
                .Include(u => u.UserTrips)
                    .ThenInclude(ut => ut.Trip)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (userWithTrips == null)
            {
                return NotFound("User not found");
            }

            var trips = userWithTrips.UserTrips.Select(ut => new
            {
                ut.Trip.Id,
                ut.Trip.Title,
                ut.Trip.Description,
                ut.Trip.StartDate,
                ut.Trip.EndDate,
                UserRole = ut.Role
            }).ToList();

            return Ok(trips);
        }


        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetTrip(int id)
        {
            var trip = await _context.Trips
                .Include(t => t.UserTrips)
                .ThenInclude(ut => ut.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (trip == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userTrip = trip.UserTrips.FirstOrDefault(ut => ut.User.Id == userId);

            if (userTrip == null)
            {
                return Forbid();
            }

            return Ok(new { trip.Id, trip.Title, trip.Description, UserRole = userTrip.Role });
        }

        #endregion

        #region PATCH

        [HttpPatch("update/{id}/title")]
        public async Task<IActionResult> UpdateTripTitle(int id, [FromBody] string newTitle)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
            {
                return NotFound();
            }

            if (!await UserHasAccessToTrip(id))
            {
                return Forbid();
            }

            trip.Title = newTitle;
            await _context.SaveChangesAsync();

            return Ok(new { trip.Id, trip.Title });
        }

        [HttpPatch("update/{id}/description")]
        public async Task<IActionResult> UpdateTripDescription(int id, [FromBody] string newDescription)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
            {
                return NotFound();
            }

            if (!await UserHasAccessToTrip(id))
            {
                return Forbid();
            }

            trip.Description = newDescription;
            await _context.SaveChangesAsync();

            return Ok(new { trip.Id, trip.Description });
        }

        [HttpPatch("update/{id}/dates")]
        public async Task<IActionResult> UpdateTripDates(int id, [FromBody] UpdateDatesDto datesDto)
        {
            var trip = await _context.Trips.FindAsync(id);
            if (trip == null)
            {
                return NotFound();
            }

            if (!await UserHasAccessToTrip(id))
            {
                return Forbid();
            }

            trip.StartDate = datesDto.StartDate;
            trip.EndDate = datesDto.EndDate;
            await _context.SaveChangesAsync();

            return Ok(new { trip.Id, trip.StartDate, trip.EndDate });
        }

        // Helper method to check if the current user has access to the trip
        private async Task<bool> UserHasAccessToTrip(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Trips.AnyAsync(t => t.Id == id && t.UserTrips.Any(ut => ut.UserId ==  userId) );
        }

        #endregion
    }
}
