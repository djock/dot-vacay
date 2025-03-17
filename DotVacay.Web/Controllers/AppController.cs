using DotVacay.Core.Entities;
using DotVacay.Core.Models.Results;
using DotVacay.Web.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Security.Claims;

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

            var viewModel = new AppIndexViewModel();

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TripsListResult>(responseContent);

                if (result != null && result.Success)
                {
                    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
                    viewModel.Trips = result.Trips.Select(trip => TripListItemViewModel.FromTrip(trip, userId)).ToList();
                }
                else if (result?.Errors?.Any() == true)
                {
                    TempData["FailMessage"] = result.Errors.FirstOrDefault();
                }
            }
            else
            {
                TempData["FailMessage"] = "Request failed.";
            }

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> Index(CreateTripViewModel model)
        {
            if (!ModelState.IsValid)
            {
                var viewModel = new AppIndexViewModel { CreateTrip = model };
                return View(viewModel);
            }

            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.PostAsJsonAsync("api/Trip/create", model);

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Trip created successfully!";
            }
            else
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<RequestResult>();
                TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to create trip.";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.DeleteAsync($"api/Trip/delete/{tripId}");

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Trip deleted successfully!";
            }
            else
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<RequestResult>();
                TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to delete trip.";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public async Task<IActionResult> Leave(int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.PostAsync($"api/Trip/leave/{tripId}", null);

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Left trip successfully!";
            }
            else
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<RequestResult>();
                TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to leave trip.";
            }

            return RedirectToAction(nameof(Index));
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
