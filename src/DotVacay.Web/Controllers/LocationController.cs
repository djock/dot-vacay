using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System;

public class LocationController : Controller
{
    private readonly IHttpClientFactory _clientFactory;
    private const string NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

    public LocationController(IHttpClientFactory clientFactory)
    {
        _clientFactory = clientFactory;
    }

    [HttpGet]
    [Route("api/locations/search")]
    public async Task<IActionResult> SearchLocations([FromQuery] string query)
    {
        if (string.IsNullOrEmpty(query) || query.Length < 2)
            return Ok(Array.Empty<object>());

        var client = _clientFactory.CreateClient();
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
                return Ok(content);
            }

            return BadRequest("Failed to fetch locations");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }
} 