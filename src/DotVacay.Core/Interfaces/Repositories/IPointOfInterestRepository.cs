using DotVacay.Core.Entities;
using DotVacay.Core.Models.Requests;

namespace DotVacay.Core.Interfaces.Repositories
{
    public interface IPointOfInterestRepository
    {
        Task AddAsync(PointOfInterest poi);
        Task AddRangeAsync(IEnumerable<PointOfInterest> pointsOfInterest);
        Task<PointOfInterest?> GetByIdAsync(int id);
        Task<IEnumerable<PointOfInterest>?> GetAllAsync(int id);
        Task<IEnumerable<PointOfInterest>> GetByTripIdAsync(int tripId);
        Task Remove(PointOfInterest poi);
        Task SaveChangesAsync();
    }
}

