﻿using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;

namespace DotVacay.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request);
        Task<AuthResult> LoginAsync(LoginRequest request);
        Task<ProfileResult> GetProfile(string userEmail);
    }
}
