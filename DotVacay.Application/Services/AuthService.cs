﻿using DotVacay.Core.Common;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace DotVacay.Application.Services
{
    public class AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration) : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly IConfiguration _configuration = configuration;

        public async Task<AuthResult> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, request.Password))
            {
                var token = GenerateJwtToken(user);
                return new AuthResult(true, token);
            }

            return new(false,string.Empty, Errors: [DomainErrors.Auth.InvalidCredentials]);  
        }

        public async Task<AuthResult> RegisterAsync(RegisterRequest request)
        {
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };

            var result = await _userManager.CreateAsync(user, request.Password);

            if(result.Succeeded)
            {
                var token = GenerateJwtToken(user);
                return new AuthResult(true, token);
            }

            return new AuthResult(false, string.Empty, Errors: result.Errors.Select(e => e.Description));
        }

        private string GenerateJwtToken(ApplicationUser user)
        {
            var userEmail = user.Email ?? null;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, userEmail ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.NormalizedUserName ?? "")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"]));


            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
