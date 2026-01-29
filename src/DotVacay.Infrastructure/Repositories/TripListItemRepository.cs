using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Repositories
{
    public class TripListItemRepository(ApplicationDbContext context) : ITripListItemRepository
    {
        public async Task AddAsync(TripListItem tripListItem)
        {
            context.TripListItems.Add(tripListItem);
            await SaveChangesAsync();
        }

        public async Task<TripListItem?> GetByIdAsync(int id)
        {
            return await context.TripListItems
                .FirstOrDefaultAsync(tli => tli.Id == id);
        }

        public async Task RemoveAsync(TripListItem tripListItem)
        {
            context.TripListItems.Remove(tripListItem);
            await SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }
    }
}
