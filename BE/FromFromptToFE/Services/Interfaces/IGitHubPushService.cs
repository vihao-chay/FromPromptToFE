using FromFromptToFE.DTOs.GitHub;

namespace FromFromptToFE.Services.Interfaces
{
    public interface IGitHubPushService
    {
        Task<PushResultDto> PushToGitHubAsync(Guid userId, PushToGitHubDto dto);
    }
}
