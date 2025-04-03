using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Core.Models.Requests;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Repositories
{
    public class TripRepository(ApplicationDbContext context) : ITripRepository
    {
        public async Task AddAsync(Trip trip)
        {
            context.Trips.Add(trip);
            await SaveChangesAsync();
        } 
        public async Task RemoveAsync(Trip trip)
        {
            context.Trips.Remove(trip);
            await SaveChangesAsync();
        }

        public async Task<Trip?> GetByIdAsync(int id)
        {
            var trip = await  context.Trips
                 .Include(t => t.UserTrips)
                 .FirstOrDefaultAsync(t => t.Id == id);

            return trip;
        }

        public async Task<IEnumerable<Trip>> GetTripsByUserIdAsync(string userId)
        {
            return await context.Trips
                .Include(t => t.UserTrips)
                .Include(t => t.PointsOfInterest)
                .Where(t => t.UserTrips.Any(ut => ut.UserId == userId))
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }

        public async Task UpdateDatesAsync(UpdateDatesRequest request)
        {
            var trip = await GetByIdAsync(request.Id);
            if (trip != null)
            {
                trip.StartDate = request.StartDate;
                trip.EndDate = request.EndDate;
                await SaveChangesAsync();
            }
        }

        public async Task UpdateDescriptionAsync(UpdateTextRequest request)
        {
            var trip = await GetByIdAsync(request.Id);
            if (trip != null)
            {
                trip.Description = request.NewText;
                await SaveChangesAsync();
            }
        }

        public async Task UpdateTitleAsync(UpdateTextRequest request)
        {
            var trip = await GetByIdAsync(request.Id);
            if (trip != null)
            {
                trip.Title = request.NewText;
                await SaveChangesAsync();
            }
        }
    }
}
