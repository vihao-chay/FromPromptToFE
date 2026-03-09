using FromFromptToFE.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace FromFromptToFE.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> emailSettings, 
            IConfiguration configuration,
            ILogger<EmailService> logger)
        {
            _emailSettings = emailSettings.Value;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendVerificationEmailAsync(string email, string name, string verifyToken)
        {
            try
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                var verificationLink = $"{frontendUrl}/verify-email?token={verifyToken}";

                var emailBody = GetVerificationEmailTemplate(name, verificationLink);

                await SendEmailAsync(
                    email,
                    "Xác thực tài khoản FromPromptToFE",
                    emailBody
                );

                _logger.LogInformation("Verification email sent successfully to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to {Email}", email);
                throw new Exception($"Không thể gửi email xác thực: {ex.Message}");
            }
        }

        public async Task SendPasswordResetEmailAsync(string email, string name, string resetToken)
        {
            try
            {
                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
                var resetLink = $"{frontendUrl}/reset-password?token={resetToken}";

                var emailBody = GetPasswordResetEmailTemplate(name, resetLink);

                await SendEmailAsync(
                    email,
                    "Đặt lại mật khẩu FromPromptToFE",
                    emailBody
                );

                _logger.LogInformation("Password reset email sent successfully to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}", email);
                throw new Exception($"Không thể gửi email đặt lại mật khẩu: {ex.Message}");
            }
        }

        public async Task SendOrganizationInviteEmailAsync(string email, string name, string organizationName, string role, string joinLink, string rejectLink)
        {
            try
            {
                var emailBody = GetOrganizationInviteEmailTemplate(name, organizationName, role, joinLink, rejectLink);

                await SendEmailAsync(
                    email,
                    $"Lời mời tham gia tổ chức {organizationName} - FromPromptToFE",
                    emailBody
                );

                _logger.LogInformation("Organization invite email sent successfully to {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send organization invite email to {Email}", email);
                throw new Exception($"Không thể gửi email mời tham gia tổ chức: {ex.Message}");
            }
        }

        private async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress("", toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                // Connect to SMTP server
                await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);

                // Authenticate
                await client.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);

                // Send email
                await client.SendAsync(message);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMTP Error while sending email to {Email}", toEmail);
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }

        private string GetVerificationEmailTemplate(string name, string verificationLink)
        {
            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Xác thực email</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse; background-color: #f4f4f7;"">
        <tr>
            <td align=""center"" style=""padding: 40px 0;"">
                <table role=""presentation"" style=""width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;"">FromPromptToFE</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;"">
                                Xin chào {name}! 👋
                            </h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"">
                                Cảm ơn bạn đã đăng ký tài khoản tại <strong>FromPromptToFE</strong>. Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:
                            </p>
                            
                            <!-- Button -->
                            <table role=""presentation"" style=""margin: 30px 0; width: 100%;"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{verificationLink}"" style=""display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);"">
                                            ✓ Xác thực Email
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style=""margin: 20px 0 0 0; color: #999999; font-size: 14px; line-height: 1.6;"">
                                Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;"">
                            <p style=""margin: 0; color: #999999; font-size: 14px;"">
                                © 2026 FromPromptToFE. All rights reserved.
                            </p>
                            <p style=""margin: 10px 0 0 0; color: #999999; font-size: 12px;"">
                                Email được gửi tự động, vui lòng không trả lời email này.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }

        private string GetPasswordResetEmailTemplate(string name, string resetLink)
        {
            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Đặt lại mật khẩu</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse; background-color: #f4f4f7;"">
        <tr>
            <td align=""center"" style=""padding: 40px 0;"">
                <table role=""presentation"" style=""width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;"">FromPromptToFE</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;"">
                                Xin chào {name}! 🔐
                            </h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:
                            </p>
                            
                            <!-- Button -->
                            <table role=""presentation"" style=""margin: 30px 0; width: 100%;"">
                                <tr>
                                    <td align=""center"">
                                        <a href=""{resetLink}"" style=""display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.3);"">
                                            🔑 Đặt lại mật khẩu
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style=""margin: 25px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;"">
                                <p style=""margin: 0; color: #856404; font-size: 14px; line-height: 1.6;"">
                                    ⚠️ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;"">
                            <p style=""margin: 0; color: #999999; font-size: 14px;"">
                                © 2026 FromPromptToFE. All rights reserved.
                            </p>
                            <p style=""margin: 10px 0 0 0; color: #999999; font-size: 12px;"">
                                Email được gửi tự động, vui lòng không trả lời email này.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }

        private string GetOrganizationInviteEmailTemplate(string name, string organizationName, string role, string joinLink, string rejectLink)
        {
            return $@"
<!DOCTYPE html>
<html lang=""vi"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Lời mời tham gia tổ chức</title>
</head>
<body style=""margin: 0; padding: 0; background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"">
    <table role=""presentation"" style=""width: 100%; border-collapse: collapse; background-color: #f4f4f7;"">
        <tr>
            <td align=""center"" style=""padding: 40px 0;"">
                <table role=""presentation"" style=""width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;"">
                            <h1 style=""margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;"">FromPromptToFE</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;"">
                                Xin chào {name}! 🎉
                            </h2>
                            <p style=""margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;"">
                                Bạn vừa được mời tham gia vào tổ chức <strong>{organizationName}</strong> trên hệ thống <strong>FromPromptToFE</strong> với vai trò là <strong>{role}</strong>.
                            </p>
                            <p style=""margin: 0 0 24px 0; color: #666666; font-size: 16px; line-height: 1.6;"">
                                Nhấn <strong>Tham gia</strong> để chấp nhận hoặc <strong>Từ chối</strong> nếu bạn không muốn tham gia.
                            </p>
                            
                            <!-- Buttons: Join & Reject -->
                            <table role=""presentation"" style=""margin: 30px 0; width: 100%; border-collapse: collapse;"">
                                <tr>
                                    <td align=""center"" style=""padding: 0 8px;"">
                                        <a href=""{joinLink}"" style=""display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(67, 233, 123, 0.3);"">
                                            ✓ Tham gia
                                        </a>
                                    </td>
                                    <td align=""center"" style=""padding: 0 8px;"">
                                        <a href=""{rejectLink}"" style=""display: inline-block; padding: 16px 32px; background: #6c757d; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;"">
                                            ✕ Từ chối
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;"">
                            <p style=""margin: 0; color: #999999; font-size: 14px;"">
                                © 2026 FromPromptToFE. All rights reserved.
                            </p>
                            <p style=""margin: 10px 0 0 0; color: #999999; font-size: 12px;"">
                                Email được gửi tự động, vui lòng không trả lời email này.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
        }
    }
}
