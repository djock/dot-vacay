using System.ComponentModel.DataAnnotations;
using DotVacay.Core.Enums;

namespace DotVacay.Web.Models
{
    public class PointOfInterestViewModel
    {
        public int TripId { get; set; }
        public int PoiId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(100, ErrorMessage = "Title cannot be longer than 100 characters")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Type is required")]
        public PointOfInterestType Type { get; set; }

        [StringLength(500, ErrorMessage = "Description cannot be longer than 500 characters")]
        public string? Description { get; set; }

        [Url(ErrorMessage = "Please enter a valid URL")]
        public string? Url { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public int? TripDayIndex { get; set; }
    }
} 