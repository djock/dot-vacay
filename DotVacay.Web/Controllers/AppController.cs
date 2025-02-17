using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Web.Controllers
{
    public class AppController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
