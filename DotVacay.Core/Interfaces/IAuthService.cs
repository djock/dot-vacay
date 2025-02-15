using DotVacay.Core.Models;

namespace DotVacay.Core.Interfaces
{
    public interface IAuthService
    {
        Task<RequestResult> RegisterAsync(RegisterRequest request);
        Task<RequestResult> LoginAsync(LoginRequest request);
    }
}
