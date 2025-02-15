using DotVacay.Core.Models;

namespace DotVacay.Core.Common
{
    public static class DomainErrors
    {
        public static class General
        {
            public static RequestResult NotFound => new(false, Errors: ["Resource not found"]);
            public static RequestResult Forbidden => new(false, Errors:  ["User does not have access to this resource"]);
            public static RequestResult CannotModify => new(false, Errors:  ["User does not have the right do modify this resource"]);
        }

        public static class Auth
        {
            public static RequestResult InvalidCredentials => new(false, Errors: ["Invalid credentials"]);
            public static RequestResult UserNotFound => new(false, Errors: ["User not found"]);
        }

        public static class Trip
        {
            public static RequestResult NotOwner => new(false, Errors: ["Only trip owners can perform this action"]);
            public static RequestResult UserNotMember => new(false, Errors: ["User is not a member of this trip"]);
            public static RequestResult AlreadyMember => new(false, Errors: ["User already in trip"]);
        }
    }
}
