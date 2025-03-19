using System;
using System.Collections.Generic;

namespace DotVacay.Web.Models
{
    public class DayCardViewModel
    {
        public DateTime CurrentDate { get; set; }
        public IEnumerable<PointOfInterestViewModel> PointsOfInterest { get; set; } = new List<PointOfInterestViewModel>();
    }
} 