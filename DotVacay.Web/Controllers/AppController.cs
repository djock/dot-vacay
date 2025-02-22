using DotVacay.Core.Entities;
using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace DotVacay.Web.Controllers
{
    public class AppController(IHttpClientFactory clientFactory) : Controller
    {
        public async Task<IActionResult> Index()
        {
            var token = GetAuthToken();

            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.GetAsync("api/Trip/getAll");

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var trips = JsonConvert.DeserializeObject<List<TripResult>>(responseContent);

                // Pass the trips to the view
                return View(trips);
            }

            TempData["FailMessage"] = "Failed to load trips.";
            return View(new List<Trip>());
        }

        private string GetAuthToken()
        {
            if (HttpContext.Request.Cookies.TryGetValue("token", out var token) )
            {
                return token;
            }

            return string.Empty;
        }
    }
}
