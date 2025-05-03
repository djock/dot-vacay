using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace DotVacay.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class AiSuggestionController(IAiSuggestionService aiService) : ControllerBase
    {
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        private string UserEmail => User.FindFirstValue(ClaimTypes.Email) ??
                              User.FindFirstValue(JwtRegisteredClaimNames.Email) ?? "";


        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSuggestions(
            [FromQuery] string location, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate,
            [FromQuery] string tripId)
        {
            if (string.IsNullOrEmpty(location))
            {
                return BadRequest(new { success = false, errors = new[] { "Location is required" } });
            }

            if (string.IsNullOrEmpty(tripId))
            {
                return BadRequest(new { success = false, errors = new[] { "Trip ID is required" } });
            }

            var request = new GenerateTripSuggestionRequest(location, startDate, endDate, tripId, UserId, UserEmail );

            var result = await aiService.GenerateTripSuggestionsAsync(request);
            return Ok(result);
        }
    }
}

