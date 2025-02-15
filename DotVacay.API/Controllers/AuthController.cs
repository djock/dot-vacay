using DotVacay.Application.DTOs;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;


    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var request = new RegisterRequest(
            dto.Email,

            dto.Password,
            dto.FirstName,
            dto.LastName);

        var result = await _authService.RegisterAsync(request);

        return result.Success
            ? Ok(new { message = "User registered successfully" })
            : BadRequest(new { errors = result.Errors });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto
        )
    {
        var request = new LoginRequest(dto.Email, dto.Password);
        var result = await _authService.LoginAsync(request);

        return result.Success
            ? Ok(new { message = result.Token })
            : Unauthorized(new { errors = result.Errors });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        return Ok(new { message = "Logged out successfully" });
    }
}
