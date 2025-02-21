using DotVacay.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace DotVacay.Web.Controllers
{
    public class TripController(IHttpClientFactory clientFactory) : Controller
    {
        public async Task<IActionResult> Index(int tripId)
        {
            var token = GetAuthToken();

            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.GetAsync($"api/Trip/getById/{tripId}");

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var trip = JsonConvert.DeserializeObject<Trip>(responseContent);

                // Pass the specific trip to the view
                return View(trip);
            }

            TempData["FailMessage"] = "Failed to load trips.";
            return View(null);
        }

        private string GetAuthToken()
        {
            if (HttpContext.Request.Cookies.TryGetValue("token", out var token))
            {
                return token;
            }

            return string.Empty;
        }
    }
}
