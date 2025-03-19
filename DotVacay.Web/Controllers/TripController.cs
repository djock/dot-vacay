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
        private const string ApiGetTripById = "api/Trip/getById/";
        private const string ApiCreatePointOfInterest = "api/PointOfInterest/create";
        private const string ApiUpdatePointOfInterest = "api/PointOfInterest/update";
        private const string ApiLeaveTrip = "api/Trip/leave/";
        private const string ApiDeletePointOfInterest = "api/PointOfInterest/delete/";

        public async Task<IActionResult> Index(int tripId)
        {
            var token = GetAuthToken();

            if (string.IsNullOrEmpty(token))
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = CreateAuthorizedClient(token);
            var response = await client.GetAsync(ApiGetTripById + tripId);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var tripResult = JsonConvert.DeserializeObject<TripResult>(responseContent);

                if(tripResult == null) return View(null);

                if (tripResult.Success && tripResult.Trip != null)
                {
                    return View(TripViewModel.FromTrip(tripResult.Trip));
                }

                TempData["FailMessage"] = tripResult.Errors?.FirstOrDefault();
                return RedirectToAction("Index", "App");
            }

            TempData["FailMessage"] = "Request failed.";
            return RedirectToAction("Index", "App");
        }

        [HttpPost]
        public async Task<IActionResult> UpdatePointOfInterest([Bind("Id,Title,Description,Type,StartDate,EndDate,Url,Address")] CreatePointOfInterestViewModel model, int tripId)
        {
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

            var client = CreateAuthorizedClient(token);

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

            HttpResponseMessage response;

            if (model.Id.HasValue)
            {
                var updateEndpoint = $"{ApiUpdatePointOfInterest}/{model.Id.Value}";
                Console.WriteLine($"Updating POI: PATCH {updateEndpoint}");
                response = await PatchAsJsonAsync(client, updateEndpoint, pointOfInterestDto);
            }
            else
            {
                Console.WriteLine($"Creating new POI: POST {ApiCreatePointOfInterest}");
                response = await client.PostAsJsonAsync(ApiCreatePointOfInterest, pointOfInterestDto);
            }

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = model.Id.HasValue
                        ? "Point of interest updated successfully!"
                        : "Point of interest added successfully!";
            }
            else
            {
                var contentString = await response.Content.ReadAsStringAsync();
                TempData["FailMessage"] = $"Failed to save point of interest. Status: {response.StatusCode}, Response: {contentString}";
            }

            return RedirectToAction(nameof(Index), new { tripId });
        }

        // Helper method to send PATCH requests with JSON content
        private static async Task<HttpResponseMessage> PatchAsJsonAsync<T>(HttpClient client, string requestUri, T value)
        {
            var content = new StringContent(JsonConvert.SerializeObject(value), System.Text.Encoding.UTF8, "application/json");
            var request = new HttpRequestMessage(new HttpMethod("PATCH"), requestUri) { Content = content };
            return await client.SendAsync(request);
        }

        [HttpPost]
        public async Task<IActionResult> Delete(int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = CreateAuthorizedClient(token);
            var response = await client.DeleteAsync($"{ApiDeletePointOfInterest}{tripId}");

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Trip deleted successfully!";
            }
            else
            {
                try
                {
                    var contentString = await response.Content.ReadAsStringAsync();
                    
                    if (!string.IsNullOrWhiteSpace(contentString))
                    {
                        var errorResponse = JsonConvert.DeserializeObject<RequestResult>(contentString);
                        TempData["FailMessage"] = errorResponse?.Errors?.FirstOrDefault() ?? "Failed to delete trip.";
                    }
                    else
                    {
                        TempData["FailMessage"] = $"Failed to delete trip. Status code: {response.StatusCode}";
                    }
                }
                catch (Exception ex)
                {
                    TempData["FailMessage"] = $"Failed to delete trip. Error: {ex.Message}";
                }
            }

            return RedirectToAction("Index", "App");
        }

        [HttpPost]
        public async Task<IActionResult> Leave(int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) return RedirectToAction("Index", "Auth", new { failMessage = "Please login to continue." });

            var client = CreateAuthorizedClient(token);
            var response = await client.PostAsJsonAsync(ApiLeaveTrip, tripId);

            if (response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Left trip successfully!";
            }
            else
            {
                try
                {
                    var contentString = await response.Content.ReadAsStringAsync();
                    
                    if (!string.IsNullOrWhiteSpace(contentString))
                    {
                        var errorResponse = JsonConvert.DeserializeObject<RequestResult>(contentString);
                        TempData["FailMessage"] = contentString;
                    }
                    else
                    {
                        TempData["FailMessage"] = $"Failed to leave trip. Response content: {response.Content}";
                    }
                }
                catch (Exception ex)
                {
                    TempData["FailMessage"] = $"Failed to leave trip. Error: {ex.Message}";
                }
            }

            return RedirectToAction("Index", "App");
        }

        [HttpPost]
        [Route("DeletePointOfInterestItem")]
        public async Task<IActionResult> DeletePointOfInterestItem(int poiId, int tripId)
        {
            var token = GetAuthToken();
            if (string.IsNullOrEmpty(token)) 
            {
                TempData["FailMessage"] = "Please log in to access this page.";
                return RedirectToAction("Login", "Auth");
            }

            var client = CreateAuthorizedClient(token);
            
            // Log the request URL for debugging
            var requestUrl = ApiDeletePointOfInterest + poiId;
            Console.WriteLine($"Deleting POI with URL: {requestUrl}");
            
            try
            {
                var response = await client.DeleteAsync(requestUrl);
                
                Console.WriteLine($"Delete POI response: {response.StatusCode}");

                if (response.IsSuccessStatusCode)
                {
                    TempData["SuccessMessage"] = "Point of interest deleted successfully!";
                }
                else
                {
                    // First read the content as a string
                    var contentString = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error response content: {contentString}");
                    
                    // Only try to deserialize if we have content
                    string errorMessage = $"Failed to delete point of interest. Status code: {response.StatusCode}";
                    
                    if (!string.IsNullOrWhiteSpace(contentString))
                    {
                        try
                        {
                            var errorResponse = JsonConvert.DeserializeObject<RequestResult>(contentString);
                            if (errorResponse?.Errors?.Any() == true)
                            {
                                errorMessage = errorResponse.Errors.FirstOrDefault() ?? errorMessage;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Exception parsing delete response: {ex.Message}");
                        }
                    }
                    
                    TempData["FailMessage"] = errorMessage;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception making delete request: {ex}");
                TempData["FailMessage"] = $"An error occurred: {ex.Message}";
            }

            // Redirect directly to the Trip/Index page with the provided tripId
            return RedirectToAction(nameof(Index), new { tripId });
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
