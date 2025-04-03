using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Mvc;

namespace DotVacay.Web.Utils
{
    public static class ErrorHelper
    {
        public static RequestResult NotFound => new(false, Errors: ["Resource not found"]);
        public static RequestResult Forbidden => new(false, Errors: ["User does not have access to this resource"]);
        public static RequestResult CannotModify => new(false, Errors: ["User does not have the right do modify this resource"]);
    }
}
