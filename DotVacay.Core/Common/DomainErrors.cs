using DotVacay.Core.Models.Results;

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
            public static AuthResult InvalidCredentials => new(false, string.Empty, Errors: ["Invalid credentials"]);
            public static AuthResult UserNotFound => new(false, string.Empty, Errors: ["User not found"]);
        }

        public static class Trip
        {
            public static AllTripsResult Forbidden => new(false, [], Errors: ["User does not have access to this resource"]);
            public static TripIdResult UserNotFound => new(false, null, Errors: ["User not found"]);
            public static TripIdResult AlreadyMember => new(false, null, Errors: ["User already in trip"]);
            public static TripIdResult NotFound => new(false, null, Errors: ["Trip not found"]);
            public static RequestResult NotOwner => new(false, Errors: ["Only trip owners can perform this action"]);
            public static RequestResult UserNotMember => new(false, Errors: ["User is not a member of this trip"]);


        }
    }
}
