using DotVacay.Application.DTOs.Patch;
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
    public class TripListItemController(ITripListItemService service) : ControllerBase
    {
        private readonly ITripListItemService _service = service;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";

        #region POST

        [HttpPost("create")]
        [ProducesResponseType(typeof(TripListIdResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(TripListIdResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateAsync([FromBody] CreateTripListItemDto dto)
        {
            var request = new CreateTripListItemRequest(dto.TripListId, dto.Title, UserId);
            var result = await _service.CreateAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(HandleError(result.Errors!));
        }

        #endregion

        #region PATCH

        [HttpPatch("update/{id}/{tripId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Update(int id, int tripId, [FromBody] UpdateTripListItemDto dto)
        {
            var request = new UpdateTripListItemRequest(id, dto.IsChecked, UserId, tripId);
            var result = await _service.UpdateAsync(request);

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
            var result = await _service.DeleteAsync(request);

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
                "Trip list not found" => NotFound(errors),
                "Trip list item not found" => NotFound(errors),
                _ => BadRequest(errors)
            };
        }
    }
}
