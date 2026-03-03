namespace FromFromptToFE.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string email, string name, string verifyToken);
        Task SendPasswordResetEmailAsync(string email, string name, string resetToken);
        Task SendOrganizationInviteEmailAsync(string email, string name, string organizationName, string role);
    }
}
