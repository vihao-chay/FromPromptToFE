namespace FromFromptToFE.DTOs.CodeGen;

public class GenerateCodeRequestDto
{
    public string? SystemPrompt { get; set; }
    public string? ErdSchema { get; set; }
    public string? ApiSpec { get; set; }
    public string? DesignSystem { get; set; }
}
