using DotVacay.Core.Entities;
using DotVacay.Core.Models.Requests;

namespace DotVacay.Core.Interfaces.Repositories
{
    public interface ITripRepository
    {
        Task AddAsync(Trip trip);
        Task RemoveAsync(Trip trip);
        Task<Trip?> GetByIdAsync(int id);
        Task<IEnumerable<Trip>> GetTripsByUserIdAsync(string userId);
        Task UpdateDatesAsync(UpdateDatesRequest request);
        Task UpdateDescriptionAsync(UpdateTextRequest request);
        Task UpdateTitleAsync(UpdateTextRequest request);
        Task SaveChangesAsync();
    }
}
