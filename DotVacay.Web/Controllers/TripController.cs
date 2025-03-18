using DotVacay.Core.Models.Dtos;
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
        public async Task<IActionResult> AddPointOfInterest([Bind("Id,Title,Description,Type,StartDate,EndDate,Url,Address")] CreatePointOfInterestViewModel model, int tripId)
        {
            Console.WriteLine("ModelState.IsValid " + ModelState.IsValid);

            if (!ModelState.IsValid)
            {
                var errors = string.Join("; ", ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage));
                TempData["FailMessage"] = $"Invalid form data: {errors}";
                return RedirectToAction(nameof(Index), new { tripId });
            }

            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var pointOfInterestDto = new CreatePointOfInterestDto
            {
                Id = model.Id,
                Title = model.Title,
                Description = model.Description ?? "",
                Type = model.Type,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                TripId = tripId,
                Url = model.Url,
                Address = model.Address
            };

            var endpoint = model.Id.HasValue ? "api/PointOfInterest/update" : "api/PointOfInterest/create";
            var response = await client.PostAsJsonAsync(endpoint, pointOfInterestDto);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<TripResult>(responseContent);

                if (result?.Success == true)
                {
                    TempData["SuccessMessage"] = model.Id.HasValue 
                        ? "Point of interest updated successfully!" 
                        : "Point of interest added successfully!";
                    return RedirectToAction(nameof(Index), new { tripId });
                }

                TempData["FailMessage"] = result?.Errors?.FirstOrDefault() ?? "Failed to save point of interest.";
            }
            else
            {
                TempData["FailMessage"] = "Failed to save point of interest.";
            }

            return RedirectToAction(nameof(Index), new { tripId });
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

            return RedirectToAction("Index", "App");
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

            return RedirectToAction("Index", "App");
        }

        [HttpPost]
        public async Task<IActionResult> DeletePointOfInterest(int poiId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = clientFactory.CreateClient("ApiClient");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await client.DeleteAsync($"api/PointOfInterest/delete/{poiId}");

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Point of interest deleted successfully!";
            }
            else
            {
                var errorResponse = await response.Content.ReadFromJsonAsync<RequestResult>();
                TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to delete point of interest.";
            }

            // Get the tripId from the referer URL
            var referer = Request.Headers["Referer"].ToString();
            var tripIdMatch = System.Text.RegularExpressions.Regex.Match(referer, @"/Trip/Index/(\d+)");
            if (tripIdMatch.Success && int.TryParse(tripIdMatch.Groups[1].Value, out int tripId))
            {
                return RedirectToAction(nameof(Index), new { tripId });
            }

            return RedirectToAction("Index", "App");
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
