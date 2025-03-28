using System.ComponentModel.DataAnnotations;

namespace DotVacay.Web.Models
{
    public class RegistrationModel
    {
        [Required]
        public required string FirstName { get; set; }

        [Required]
        public required string LastName { get; set; }

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public required string Password { get; set; }

        [DataType(DataType.Password)]
        [Compare("Password")]
        public required string ConfirmPassword { get; set; }
    }
}
