using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Repositories
{
    public class TripListRepository(ApplicationDbContext context) : ITripListRepository
    {
        public async Task AddAsync(TripList tripList)
        {
            context.TripLists.Add(tripList);
            await SaveChangesAsync();
        }

        public async Task<TripList?> GetByIdAsync(int id)
        {
            return await context.TripLists
                .Include(tl => tl.ListItems)
                .FirstOrDefaultAsync(tl => tl.Id == id);
        }

        public async Task<IEnumerable<TripList>> GetByTripIdAsync(int tripId)
        {
            return await context.TripLists
                .Include(tl => tl.ListItems)
                .Where(tl => tl.TripId == tripId)
                .ToListAsync();
        }

        public async Task RemoveAsync(TripList tripList)
        {
            context.TripLists.Remove(tripList);
            await SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }
    }
}
