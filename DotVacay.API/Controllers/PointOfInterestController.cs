using DotVacay.Application.DTOs.Patch;
using DotVacay.Application.DTOs.Post;
using DotVacay.Core.Enums;
using DotVacay.Core.Interfaces.Services;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DotVacay.API.Controllers
{
    [Route("[controller]")]
    [ApiController]
    [Authorize]
    public class PointOfInterestController(IPointOfInterestService service) : ControllerBase
    {
        private readonly IPointOfInterestService _service = service;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";


        #region POST

        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync([FromBody] CreatePointOfInterestDto dto)
        {
            if(string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            Console.WriteLine("POI create");

            var request = new CreatePointOfInterestRequest(
                UserId,
                dto.Title,
                dto.Description ?? "",
                dto.Url ?? "",
                dto.Latitude,
                dto.Longitude,
                dto.Type,
                dto.TripId, 
                dto.StartDate, 
                dto.EndDate,
                -1
                );

            var result = await _service.CreateAsync(request);
            return HandleResult(result);
        }

        #endregion

        #region GET

        [HttpGet("getAll/{tripId}")]
        public async Task<IActionResult> GetAllAsync(int tripId)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.GetAllAsync(new(tripId, UserId));
            return HandleResult(result);
        }


        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetByIdAsync(int id)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.GetByIdAsync(new(id, UserId));
            return HandleResult(result);
        }

        #endregion

        #region PATCH

        [HttpPatch("update/{id}")]
        public async Task<IActionResult> UpdateAsync(int id, [FromBody] CreatePointOfInterestDto dto)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var request = new UpdatePointOfInterestRequest(
                  id,
                  UserId,
                  dto.Title,
                  dto.Description ?? "",
                  dto.Url ?? "",
                  dto.Latitude,
                  dto.Longitude,
                  dto.Type,
                  dto.TripId,
                  dto.StartDate,
                  dto.EndDate);

            var result = await _service.UpdateAsync(request);
            return HandleResult(result);
        }


        [HttpPatch("update/{id}/type")]
        public async Task<IActionResult> UpdateTypeAsync(int id, [FromBody] PointOfInterestType newType)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateTypeAsync(new UpdateTypeRequest(id, newType, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/title")]
        public async Task<IActionResult> UpdateTitleAsync(int id, [FromBody] string newTitle)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateTitleAsync(new UpdateTextRequest(id, newTitle, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/description")]
        public async Task<IActionResult> UpdateDescriptionAsync(int id, [FromBody] string newDescription)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateDescriptionAsync(new UpdateTextRequest(id, newDescription, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/url")]
        public async Task<IActionResult> UpdateUrlAsync(int id, [FromBody] string newUrl)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateUrlAsync(new UpdateTextRequest(id, newUrl, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/coordinates")]
        public async Task<IActionResult> UpdateCoordinatesAsync(int id, [FromBody] UpdateCoordinatesDto coordinates)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateCoordinatesAsync(new UpdateCoordinatesRequest(id, coordinates.Latitude!, coordinates.Longitude!, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/dates")]
        public async Task<IActionResult> UpdateDatesAsync(int id, [FromBody] UpdateDatesDto dates)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateDatesAsync(new UpdateDatesRequest(id, dates.StartDate, dates.EndDate, UserId));
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/tripDayIndex")]
        public async Task<IActionResult> UpdateTripDayIndexAsync(int id, [FromBody] int? newTripDayIndex)
        {
            if (string.IsNullOrEmpty(UserId))
            {
                return BadRequest("UserId not found");
            }

            var result = await _service.UpdateTripDayIndexAsync(new UpdateTripDayIndexRequest(id, newTripDayIndex, UserId));
            return HandleResult(result);
        }

        #endregion

        #region DELETE

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAsync(int id)
        {
            var result = await _service.DeleteAsync(new(id, UserId));
            return HandleResult(result);
        }

        #endregion

        private IActionResult HandleResult(RequestResult result)
        {
            return result.Success
                ? result.Data != null ? Ok(result.Data) : Ok()
                : result.Errors?.First() switch
                {
                    "Forbidden" => Forbid(),
                    "Trip not found" => NotFound(result),
                    "Point not found" => NotFound(result),
                    _ => BadRequest(result)
                };
        }
    }
}
