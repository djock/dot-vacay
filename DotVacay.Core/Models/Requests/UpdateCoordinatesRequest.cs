namespace DotVacay.Core.Models.Requests
{
    public record UpdateCoordinatesRequest(int Id, double Latitude, double Longitude, string UserId);

}
