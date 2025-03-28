namespace DotVacay.Core.Models.Requests
{
    public record UpdateTextRequest(int Id, string NewText, string UserId);
}
