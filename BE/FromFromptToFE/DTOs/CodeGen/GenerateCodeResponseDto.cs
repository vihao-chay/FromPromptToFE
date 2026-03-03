namespace FromFromptToFE.DTOs.CodeGen;

public class GenerateCodeResponseDto
{
    public List<string> Steps { get; set; } = new();
    public string Tsx { get; set; } = string.Empty;
    public string Html { get; set; } = string.Empty;
}
