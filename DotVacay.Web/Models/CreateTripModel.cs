using System.ComponentModel.DataAnnotations;

namespace DotVacay.Web.Models
{
    public class CreateTripModel
    {
        [Required]
        public string Title { get; set; }
        public DateTimeOffset? StartDate{ get; set; }
        public DateTimeOffset? EndDate{ get; set; }
    }
}
