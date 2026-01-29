using DotVacay.Core.Entities;

namespace DotVacay.Core.Interfaces.Repositories
{
    public interface ITripListRepository
    {
        Task AddAsync(TripList tripList);
        Task<TripList?> GetByIdAsync(int id);
        Task<IEnumerable<TripList>> GetByTripIdAsync(int tripId);
        Task RemoveAsync(TripList tripList);
        Task SaveChangesAsync();
    }
}
