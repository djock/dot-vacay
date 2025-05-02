using DotVacay.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class AiSuggestionController(IAiSuggestionService aiService) : ControllerBase
    {
        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSuggestions(
            [FromQuery] string location, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            if (string.IsNullOrEmpty(location))
            {
                return BadRequest(new { success = false, errors = new[] { "Location is required" } });
            }

            var result = await aiService.GenerateTripSuggestionsAsync(location, startDate, endDate);
            return Ok(result);
        }
    }
}

