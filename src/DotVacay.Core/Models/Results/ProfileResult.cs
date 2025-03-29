
namespace DotVacay.Core.Models.Results
{
    public class ProfileResult
    {
        public bool Success { get; set; }
        public UserProfile? UserProfile { get; set; } = null;
        public IEnumerable<string>? Errors { get; set; } = null;
    }
}

