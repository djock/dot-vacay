using DotVacay.Application.DTOs.Post;
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
    public class TripListController(ITripListService tripListService, ITripListItemService tripListItemService) : ControllerBase
    {
        private readonly ITripListService _tripListService = tripListService;
        private readonly ITripListItemService _tripListItemService = tripListItemService;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        #region POST

        [HttpPost("create")]
        [ProducesResponseType(typeof(TripListIdResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(TripListIdResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateTripListDto dto)
        {
            var request = new CreateTripListRequest(dto.TripId, dto.Title, UserId);
            var result = await _tripListService.CreateAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(HandleError(result.Errors!));
        }

        #endregion

        #region GET

        [HttpGet("getByTrip/{tripId}")]
        [ProducesResponseType(typeof(TripListsResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(TripListsResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetByTripId(int tripId)
        {
            var request = new UserResourceIdRequest(tripId, UserId);
            var result = await _tripListService.GetByTripIdAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(HandleError(result.Errors!));
        }

        #endregion

        #region DELETE

        [HttpDelete("delete/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Delete(int id)
        {
            var request = new UserResourceIdRequest(id, UserId);
            var result = await _tripListService.DeleteAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(HandleError(result.Errors!));
        }

        #endregion

        private IActionResult HandleError(IEnumerable<string> errors)
        {
            return errors?.FirstOrDefault() switch
            {
                "Forbidden" => Forbid(),
                "User not found" => Unauthorized(errors),
                "Trip not found" => NotFound(errors),
                _ => BadRequest(errors)
            };
        }
    }
}
