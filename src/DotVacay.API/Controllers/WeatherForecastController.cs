using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace DotVacay.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class WeatherForecastController(IHttpClientFactory clientFactory) : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory = clientFactory;
        private const string WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

        [HttpGet("forecast")]
        public async Task<IActionResult> GetForecast(
            [FromQuery] double latitude,
            [FromQuery] double longitude,
            [FromQuery] DateTime date)
        {
            try
            {
                // Check if date is within next 14 days
                var today = DateTime.UtcNow.Date;
                var requestDate = date.Date;

                var client = _clientFactory.CreateClient();
                
                // Format dates for API request
                var formattedDate = date.ToString("yyyy-MM-dd");
                
                var response = await client.GetAsync(
                    $"{WEATHER_API_URL}?" +
                    $"latitude={latitude}&" +
                    $"longitude={longitude}&" +
                    $"daily=temperature_2m_max,temperature_2m_min,weathercode&" +
                    $"timezone=auto&" +
                    $"start_date={formattedDate}&" +
                    $"end_date={formattedDate}"
                );

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }

                return BadRequest("Failed to fetch weather forecast");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error: {ex.Message}");
            }
        }
    }
}