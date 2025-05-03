using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Repositories
{
    public class PointOfInterestRepository(ApplicationDbContext context) : IPointOfInterestRepository
    {
        public async Task AddAsync(PointOfInterest poi)
        {
            context.PointsOfInterest.Add(poi);
            await SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<PointOfInterest> pointsOfInterest)
        {
            context.PointsOfInterest.AddRange(pointsOfInterest);
            await SaveChangesAsync();
        }

        public async Task<IEnumerable<PointOfInterest>?> GetAllAsync(int id)
        {
            var pois = await context.PointsOfInterest
              .Where(p => p.TripId == id)
              .ToListAsync();

            return pois;
        }

        public async Task<PointOfInterest?> GetByIdAsync(int id)
        {
            var pointOfInterest = await context.PointsOfInterest
               .FirstOrDefaultAsync(poi => poi.Id == id);

            return pointOfInterest;
        }

        public Task<IEnumerable<PointOfInterest>> GetByTripIdAsync(int tripId)
        {
            throw new NotImplementedException();
        }

        public async Task Remove(PointOfInterest poi)
        {
            context.PointsOfInterest.Remove(poi);
            await SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await context.SaveChangesAsync();
        }
    }
}   

