using DotVacay.Core.Models.Results;
using DotVacay.Web.Models;
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
                var tripResult = JsonConvert.DeserializeObject<TripResult>(responseContent);

                if(tripResult == null) return View(null);

                if (tripResult.Success && tripResult.Trip != null)
                {
                    return View(TripViewModel.FromTrip(tripResult.Trip));
                }

                TempData["FailMessage"] = tripResult.Errors.FirstOrDefault();
                return RedirectToAction("Index", "App");
            }

            TempData["FailMessage"] = "Request failed.";
            return RedirectToAction("Index", "App");
        }

        [HttpPost]
        public async Task<IActionResult> AddPointOfInterest(PointOfInterestViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return RedirectToAction(nameof(Index), new { tripId = model.TripId });
            }

            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.PostAsJsonAsync("api/PointOfInterest/create", model);

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Place added successfully!";
            }
            else
            {
                var error = await response.Content.ReadFromJsonAsync<dynamic>();
                TempData["FailMessage"] = error?.errors?.FirstOrDefault() ?? "Failed to add place.";
            }

            return RedirectToAction(nameof(Index), new { tripId = model.TripId });
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
