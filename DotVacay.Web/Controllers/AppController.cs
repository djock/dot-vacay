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
        private const string ApiGetAllTrips = "api/Trip/getAll";
        private const string ApiCreateTrip = "api/Trip/create";
        private const string ApiDeleteTrip = "api/Trip/delete/";
        private const string ApiLeaveTrip = "api/Trip/leave/";

        public async Task<IActionResult> Index()
        {
            var token = GetAuthToken();

            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = CreateAuthorizedClient(token);
            var response = await client.GetAsync(ApiGetAllTrips);

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
        public async Task<IActionResult> Index([FromForm] CreateTripViewModel model)
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

            var client = CreateAuthorizedClient(token);
            var response = await client.PostAsJsonAsync(ApiCreateTrip, new
            {
                model.Title,
                model.Description,
                model.StartDate,
                model.EndDate
            });

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TripIdResult>(responseContent);

                if (result != null && result.Success)
                {
                    TempData["SuccessMessage"] = "Trip created successfully!";
                    return RedirectToAction("Index", "Trip", new { tripId = result.TripId });
                }
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            var errorResponse = JsonConvert.DeserializeObject<RequestResult>(errorContent);
            TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to create trip.";

            var errorViewModel = new AppIndexViewModel { CreateTrip = model };
            return View(errorViewModel);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = CreateAuthorizedClient(token);
            var response = await client.DeleteAsync($"{ApiDeleteTrip}{tripId}");

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

            var client = CreateAuthorizedClient(token);
            var response = await client.PostAsync($"{ApiLeaveTrip}{tripId}", null);

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

        private HttpClient CreateAuthorizedClient(string token)
        {
            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }
    }
}
