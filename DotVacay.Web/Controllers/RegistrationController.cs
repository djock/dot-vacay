using DotVacay.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Web.Controllers
{
    public class RegistrationController(IHttpClientFactory clientFactory) : Controller
    {
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegistrationModel model)
        {
            if (!ModelState.IsValid)
            {
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
                TempData["SuccessMessage"] = "Registration successful!";
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

            Console.WriteLine(model.ToString());

            var client = clientFactory.CreateClient("ApiClient");
            var response = await client.PostAsJsonAsync("api/Auth/login", new
            {
                model.Email,
                model.Password
            });

            Console.WriteLine(response.ToString());

            if(response.IsSuccessStatusCode)
            {
                TempData["SuccessMessage"] = "Login successful!";
                return RedirectToAction("Index", "App");
            }

            TempData["FailMessage"] = "Something went wrong!";
            return View(model);
        }
    }
}
