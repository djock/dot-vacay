using DotVacay.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Web.Controllers
{
    public class RegistrationController(IHttpClientFactory clientFactory, IWebHostEnvironment environment) : Controller
    {

        [HttpGet]
        public IActionResult Register()
        {
            ViewBag.IsProduction = environment.IsProduction();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegistrationModel model)
        {
            if (environment.IsProduction())
            {
                return RedirectToAction("Login");
            }

            if (!ModelState.IsValid)
            {
                ViewBag.IsProduction = environment.IsProduction();
                return View();
            }

            var client = clientFactory.CreateClient("ApiClient");
            var response = await client.PostAsJsonAsync("api/Auth/register", new
            {
                model.FirstName,
                model.LastName,
                model.Email,
                model.Password
            });

            if (response.IsSuccessStatusCode)
            {
                await StoreAuthToken(response.Content);

                return RedirectToAction("Index", "App");
            }

            TempData["FailMessage"] = "Something went wrong!";
            return View();
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return View();
            }

            var client = clientFactory.CreateClient("ApiClient");
            var response = await client.PostAsJsonAsync("api/Auth/login", new
            {
                model.Email,
                model.Password
            });

            if(response.IsSuccessStatusCode)
            {
                await StoreAuthToken(response.Content);

                return RedirectToAction("Index", "App");
            }

            TempData["FailMessage"] = "Something went wrong!";
            return View(model);
        }

        private async Task StoreAuthToken(HttpContent httpContent)
        {
            try {
                // Read the response content to extract the token
                var responseContent = await httpContent.ReadAsStringAsync();
                var jsonResponse = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(responseContent);

                string? token = jsonResponse?.token?.ToString();

                if(token == null)
                {
                    throw new Exception("Token not found in response");
                }

                HttpContext.Response.Cookies.Append("token", token,
                     options: new Microsoft.AspNetCore.Http.CookieOptions
                     {
                         Expires = DateTime.Now.AddMinutes(60),
                         HttpOnly = true, // Prevent client-side access
                         Secure = false
                     });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
            }
        }

    }
}
