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
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto dto)
    {
        var request = new RegisterRequest(
            dto.Email,
            dto.Password,
            dto.FirstName,
            dto.LastName);

        var result = await _authService.RegisterAsync(request);

        return result.Success
            ? Ok(new { token = result.Data })
            : BadRequest(new { errors = result.Errors });
    }

    [HttpPost("login")]
    public async Task<IActionResult> LoginAsync([FromBody] LoginDto dto)
    {
        var request = new LoginRequest(dto.Email, dto.Password);
        var result = await _authService.LoginAsync(request);

        Console.WriteLine("dto " + dto.ToString());

        return result.Success
            ? Ok(new { token = result.Data })
            : Unauthorized(new { errors = result.Errors });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        return Ok(new { message = "Logged out successfully" });
    }
}
