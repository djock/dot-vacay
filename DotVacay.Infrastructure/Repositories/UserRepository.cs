using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Repositories;
using DotVacay.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Repositories
{
    public class UserRepository(ApplicationDbContext context) : IUserRepository
    {
        public async Task<ApplicationUser?> GetByIdAsync(string id)
        {
            var user = await context.Users
                .Include(u => u.UserTrips)
              .ThenInclude(ut => ut.Trip)
                 .FirstOrDefaultAsync(u => u.Id == id);

            return user;
        }
    }
}
