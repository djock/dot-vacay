using DotVacay.Core.Entities;

namespace DotVacay.Core.Interfaces.Repositories
{
    public interface ITripListItemRepository
    {
        Task AddAsync(TripListItem tripListItem);
        Task<TripListItem?> GetByIdAsync(int id);
        Task RemoveAsync(TripListItem tripListItem);
        Task SaveChangesAsync();
    }
}
