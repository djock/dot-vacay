using DotVacay.Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class AiSuggestionController(IAiSuggestionService _aiService, ILogger<AiSuggestionController> _logger) : ControllerBase
    {
        [HttpGet("generate")]
        public async Task<IActionResult> GenerateSuggestions(
            [FromQuery] string location, 
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate,
            [FromQuery] string tripType = "vacation")
        {
            _logger.LogInformation($"Generating suggestions for {location} from {startDate} to {endDate}, type: {tripType}");
            
            if (string.IsNullOrEmpty(location))
            {
                return BadRequest(new { success = false, errors = new[] { "Location is required" } });
            }

           var result = await _aiService.GenerateTripSuggestionsAsync(location, startDate, endDate, tripType);
            return Ok(result);
        }
    }
}

