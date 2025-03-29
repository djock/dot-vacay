using DotVacay.Application.DTOs.Post;
using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.API.Controllers;

[Route("[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{

    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto dto)
    {
        var request = new RegisterRequest(
            dto.Email,
            dto.Password,
            dto.FirstName,
            dto.LastName);

        var result = await authService.RegisterAsync(request);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(AuthResult), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LoginAsync([FromBody] LoginDto dto)
    {
        var request = new LoginRequest(dto.Email, dto.Password);
        var result = await authService.LoginAsync(request);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> LogoutAsync()
    {
        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        return Ok();
    }

    [HttpGet("getProfile")] 
    public async Task<IActionResult> GetProfile([FromQuery] string userEmail)
    {
        var result = await authService.GetProfile(userEmail);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }
}
