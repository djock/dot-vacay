﻿using Microsoft.AspNetCore.Identity;

namespace DotVacay.Core.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public ICollection<UserTrip> UserTrips { get; set; } = new List<UserTrip>();
    }
}
