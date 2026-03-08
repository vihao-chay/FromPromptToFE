using FromFromptToFE.Base;
using FromFromptToFE.DTOs.GitHub;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FromFromptToFE.Controllers
{
    [ApiController]
    [Route("api/github")]
    [Authorize]
    public class GitHubController : ControllerBase
    {
        private readonly IGitHubPushService _pushService;

        public GitHubController(IGitHubPushService pushService)
        {
            _pushService = pushService;
        }

        /// <summary>
        /// Push generated project code to GitHub.
        /// </summary>
        [HttpPost("push")]
        public async Task<IActionResult> PushToGitHub([FromBody] PushToGitHubDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                    return ResponseEntity<object>.Fail("Invalid or missing token", 401);

                var result = await _pushService.PushToGitHubAsync(userId, dto);
                return ResponseEntity<PushResultDto>.Ok(result, $"Successfully pushed {result.FilesCommitted} file(s) to GitHub.");
            }
            catch (Exception ex)
            {
                return ResponseEntity<object>.Fail(ex.Message);
            }
        }
    }
}
