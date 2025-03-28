using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LocationController(IHttpClientFactory clientFactory) : ControllerBase
    {
        private const string NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";


        [HttpGet("search")]
        public async Task<IActionResult> SearchLocations([FromQuery] string query)
        {
            Console.WriteLine("Search locations " + query);

            if (string.IsNullOrEmpty(query) || query.Length < 2)
                return Ok(Array.Empty<object>());

            var client = clientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("User-Agent", "DotVacay/1.0");

            try
            {
                var response = await client.GetAsync(
                    $"{NOMINATIM_BASE_URL}/search?" +
                    $"q={Uri.EscapeDataString(query)}&" +
                    $"format=json&" +
                    $"limit=5&" +
                    $"addressdetails=1"
                );

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }

                return BadRequest("Failed to fetch locations");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpGet("searchPoi")]
        public async Task<IActionResult> SearchPointsOfInterest([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query) || query.Length < 2)
                return Ok(Array.Empty<object>());

            var client = clientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("User-Agent", "DotVacay/1.0");

            try
            {
                var response = await client.GetAsync(
                    $"{NOMINATIM_BASE_URL}/search?" +
                    $"amenity={Uri.EscapeDataString(query)}&" +
                    $"format=json&" +
                    $"limit=5&" +
                    $"addressdetails=1&" 
                );

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }

                return BadRequest("Failed to fetch points of interest");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
} 