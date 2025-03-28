using System.ComponentModel.DataAnnotations;
using DotVacay.Core.Enums;

namespace DotVacay.Web.Models
{
    public class CreatePointOfInterestViewModel
    {
        public int? Id { get; set; }
        public int TripId { get; set; }
        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters")]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters")]
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Type is required")]
        public PointOfInterestType Type { get; set; }
        
        [StringLength(200, ErrorMessage = "Address cannot be longer than 200 characters")]
        public string? Address { get; set; }
        
        [Url(ErrorMessage = "Please enter a valid URL")]
        public string? Url { get; set; }
        
        [Required(ErrorMessage = "Start date is required")]
        [Display(Name = "Start Time")]
        public DateTimeOffset StartDate { get; set; }
        
        [Required(ErrorMessage = "End date is required")]
        [Display(Name = "End Time")]
        [CustomValidation(typeof(CreatePointOfInterestViewModel), nameof(ValidateEndDate))]
        public DateTimeOffset EndDate { get; set; }

        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public static ValidationResult? ValidateEndDate(DateTimeOffset endDate, ValidationContext context)
        {
            var instance = (CreatePointOfInterestViewModel)context.ObjectInstance;
            if (endDate <= instance.StartDate)
            {
                return new ValidationResult("End time must be after start time");
            }
            return ValidationResult.Success;
        }
    }
} 