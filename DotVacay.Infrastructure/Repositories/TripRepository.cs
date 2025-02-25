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
            await context.SaveChangesAsync();
        } 
        public async Task RemoveAsync(Trip trip)
        {
            context.Trips.Remove(trip);
            await context.SaveChangesAsync();
        }

        public async Task<Trip?> GetByIdAsync(int id)
        {
            var trip = await  context.Trips
                 .Include(t => t.UserTrips)
                 .FirstOrDefaultAsync(t => t.Id == id);

            return trip;
        }

        public Task<IEnumerable<Trip>> GetTripsByUserIdAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public void SaveChanges()
        {
            context.SaveChangesAsync();
        }

        public Task UpdateDatesAsync(UpdateDatesRequest request)
        {
            throw new NotImplementedException();
        }

        public Task UpdateDescriptionAsync(UpdateTextRequest request)
        {
            throw new NotImplementedException();
        }

        public Task UpdateTitleAsync(UpdateTextRequest request)
        {
            throw new NotImplementedException();
        }
    }
}
