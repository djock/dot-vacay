using DotVacay.Application.DTOs;
using DotVacay.Application.Services;
using DotVacay.Core.Entities;
using DotVacay.Core.Interfaces;
using DotVacay.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
        public async Task<IActionResult> CreateAsync([FromBody] CreateTripDto dto)
        {
            var request = new CreateTripRequest(dto.Title, dto.Description ?? "", UserEmail);
            var result = await _service.CreateAsync(request);
            return HandleResult(result);
        }

        [HttpPost("join")]
        public async Task<IActionResult> JoinTrip([FromBody] JoinTripDto dto)
        {
            var request = new JoinTripRequest(dto.TripId, dto.Role, UserEmail);
            var result = await _service.JoinAsync(request);
            return HandleResult(result);
        }


        #endregion

        #region GET

        [HttpGet("getAll")]
        public async Task<IActionResult> GetAllTrips()
        {
            var result = await _service.GetAllAsync(UserId);
            return HandleResult(result);
        }


        [HttpGet("getById/{id}")]
        public async Task<IActionResult> GetTrip(int id)
        {
            var result = await _service.GetByIdAsync(new(id, UserId));
            return HandleResult(result);
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
