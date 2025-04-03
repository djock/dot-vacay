using System.ComponentModel.DataAnnotations;

namespace DotVacay.Web.Models
{
    public class CreateTripViewModel
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters")]
        public required string Title { get; set; }
        public string? Description { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        public DateTimeOffset? StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        public DateTimeOffset? EndDate { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
} 