using DotVacay.Core.Entities;

namespace DotVacay.Core.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> GetByIdAsync(string id);
    }
}
