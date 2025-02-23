 namespace DotVacay.Core.Common
{
    public static class DomainErrors
    {
        public static class General
        {
            public const string NotFound = "Resource not found";
            public const string Forbidden = "User does not have access to this resource";
            public const string CannotModify = "User does not have the right do modify this resource";
        }

        public static class Auth
        {
            public const string InvalidCredentials = "Invalid credentials";
            public const string UserNotFound = "User not found";
        }

        public static class Trip
        {
            public const string AlreadyMember = "User already in trip";
            public const string UserNotMember = "User is not a member of this trip";
            public const string NotOwner = "Only trip owners can perform this action";
        }
    }
}
