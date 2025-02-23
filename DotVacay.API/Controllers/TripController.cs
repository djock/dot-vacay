using DotVacay.Application.DTOs.Patch;
using DotVacay.Application.DTOs.Post;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models.Requests;
using DotVacay.Core.Models.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security.Claims;

namespace DotVacay.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TripController(ITripService service) : ControllerBase
    {
        private readonly ITripService _service = service;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "";
        private string UserEmail => User.FindFirstValue(ClaimTypes.Email) ?? 
                              User.FindFirstValue(JwtRegisteredClaimNames.Email) ?? "";

        #region POST

        [HttpPost("create")]
        [ProducesResponseType(typeof(TripIdResult), StatusCodes.Status200OK)] // Success
        [ProducesResponseType(typeof(TripIdResult), StatusCodes.Status400BadRequest)] // Bad Request
        public async Task<IActionResult> CreateAsync([FromBody] CreateTripDto dto)
        {
            var request = new CreateTripRequest(dto.Title, dto.Description ?? "", UserEmail);
            var result = await _service.CreateAsync(request);

            if(result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);

        }

        [HttpPost("join")]
        [ProducesResponseType(typeof(TripIdResult), StatusCodes.Status200OK)] 
        [ProducesResponseType(typeof(TripIdResult), StatusCodes.Status400BadRequest)] 
        public async Task<IActionResult> JoinTrip([FromBody] JoinTripDto dto)
        {
            var request = new JoinTripRequest(dto.TripId, dto.Role, UserEmail);
            var result = await _service.JoinAsync(request);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }


        #endregion

        #region GET

        [HttpGet("getAll")]
        [ProducesResponseType(typeof(List<Trip>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(List<Trip>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAllTrips()
        {
            var result = await _service.GetAllAsync(UserId);

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }


        [HttpGet("getById/{id}")]
        [ProducesResponseType(typeof(TripResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(TripResult), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetTrip(int id)
        {
            var result = await _service.GetByIdAsync(new(id, UserId));

            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }

        #endregion

        #region PATCH

        [HttpPatch("update/{id}/title")]
        public async Task<IActionResult> UpdateTripTitle(int id, [FromBody] string newTitle)
        {
            var request = new UpdateTextRequest(id, newTitle, UserId);
            var result = await _service.UpdateTitleAsync(request);
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/description")]
        public async Task<IActionResult> UpdateTripDescription(int id, [FromBody] string newDescription)
        {
            var request = new UpdateTextRequest(id, newDescription, UserId);
            var result = await _service.UpdateDescriptionAsync(request);
            return HandleResult(result);
        }

        [HttpPatch("update/{id}/dates")]
        public async Task<IActionResult> UpdateTripDates(int id, [FromBody] UpdateDatesDto datesDto)
        {
            var request = new UpdateDatesRequest(id, datesDto.StartDate, datesDto.EndDate, UserId);
            var result = await _service.UpdateDatesAsync(request);
            return HandleResult(result);
        }

        #endregion

        #region DELETE

        [HttpDelete("delete/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> DeleteTrip(int id)
        {
            var result = await _service.DeleteAsync(new(id, UserId));
            return HandleResult(result);
        }

        #endregion

        private IActionResult HandleResult(RequestResult result)
        {
            return result.Success
                ? result.Data  != null ?  Ok(result.Data) : Ok()
                : result.Errors?.FirstOrDefault() switch
                {
                    "Forbidden" => Forbid(),
                    "User not found" => Unauthorized(result.Errors),
                    "Trip not found" => NotFound(result.Errors),
                    "User already in trip" => Conflict(result.Errors),
                    _ => BadRequest(result.Errors)
                };
        }
    }
}
