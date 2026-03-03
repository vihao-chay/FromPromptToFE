using System.Text.Json;
using System.Text.RegularExpressions;
using FromFromptToFE.DTOs.CodeGen;
using FromFromptToFE.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FromFromptToFE.Services;

public class CodeGenService : ICodeGenService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private const string GeminiBase = "https://generativelanguage.googleapis.com";

    public CodeGenService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<GenerateCodeResponseDto> GenerateAsync(GenerateCodeRequestDto request, CancellationToken cancellationToken = default)
    {
        // Prefer appsettings "Gemini:ApiKey", then env GEMINI_API_KEY (e.g. set GEMINI_API_KEY=xxx before dotnet run)
        var apiKey = _configuration["Gemini:ApiKey"]?.Trim();
        if (string.IsNullOrWhiteSpace(apiKey))
            apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")?.Trim();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new GenerateCodeResponseDto
            {
                Steps = GetDefaultSteps(),
                Tsx = "// Error: Gemini:ApiKey not configured. Add it in appsettings.json or environment.",
                Html = "<!-- Error: Gemini:ApiKey not configured. -->"
            };
        }

        var prompt = BuildPrompt(request);
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(120);

        // Prefer gemini-2.0-flash or gemini-flash
        var modelIds = new[] { "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro" };
        Exception? lastError = null;

        foreach (var modelId in modelIds)
        {
            foreach (var apiVersion in new[] { "v1beta", "v1" })
            {
                try
                {
                    var url = $"{GeminiBase}/{apiVersion}/models/{modelId}:generateContent?key={Uri.EscapeDataString(apiKey)}";
                    var body = new
                    {
                        contents = new[] { new { parts = new[] { new { text = prompt } } } },
                        generationConfig = new { temperature = 0.4, maxOutputTokens = 16384 }
                    };
                    var response = await client.PostAsJsonAsync(url, body, cancellationToken);
                    if (!response.IsSuccessStatusCode)
                    {
                        lastError = new HttpRequestException($"Gemini {response.StatusCode}: {await response.Content.ReadAsStringAsync(cancellationToken)}");
                        continue;
                    }

                    var json = await response.Content.ReadAsStringAsync(cancellationToken);
                    var doc = JsonDocument.Parse(json);
                    var text = doc.RootElement
                        .TryGetProperty("candidates", out var cands) && cands.GetArrayLength() > 0
                        && cands[0].TryGetProperty("content", out var content)
                        && content.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0
                        && parts[0].TryGetProperty("text", out var textEl)
                        ? textEl.GetString()
                        : null;

                    if (string.IsNullOrEmpty(text))
                    {
                        lastError = new InvalidOperationException("No text in Gemini response");
                        continue;
                    }

                    return ParseResponse(text);
                }
                catch (Exception ex)
                {
                    lastError = ex;
                }
            }
        }

        var errMsg = lastError?.Message ?? "Unknown error";
        return new GenerateCodeResponseDto
        {
            Steps = GetDefaultSteps(),
            Tsx = $"// Error: {errMsg}\n// Get key: https://aistudio.google.com/apikey",
            Html = $"<!-- Error: {errMsg} -->"
        };
    }

    private static string BuildPrompt(GenerateCodeRequestDto request)
    {
        var systemPrompt = request.SystemPrompt?.Trim() ?? "A modern React UI.";
        var erd = request.ErdSchema?.Trim() ?? "(none)";
        var apiSpec = request.ApiSpec?.Trim() ?? "(none)";
        var design = request.DesignSystem?.Trim() ?? "{}";

        return $@"You are a senior frontend engineer. Generate the SAME UI in TWO formats at once.

## System Prompt (main instruction)
{systemPrompt}

## ERD / Schema (DBML)
{erd}

## API Spec (OpenAPI)
{apiSpec}

## Design System (JSON)
{design}

OUTPUT EXACTLY THREE BLOCKS in this order:

1) A JSON block with exactly 4 step descriptions in the SAME language as the user's ""System Prompt"" above (Vietnamese prompt → Vietnamese; English → English). Use this exact format:
```json
{{""steps"": [""First step."", ""Second step."", ""Third step."", ""Fourth step.""]}}
```

2) React + TypeScript (TSX) – one component file, Tailwind CSS, default export. Use comments in the SAME language as the user's prompt. Output COMPLETE full code – do not abbreviate or shorten.
```tsx
... your full TSX code ...
```

3) Standalone HTML – same layout and style, one full HTML file with <!DOCTYPE html>, Tailwind via CDN or <style>. Use comments in the SAME language as the user's prompt. Output COMPLETE full code – do not abbreviate or shorten.
```html
... your HTML code ...
```

Requirements: Same UI and styling in both TSX and HTML; same language as the user prompt for steps and all comments. Output ONLY these three blocks (json, tsx, html), no other text. Output full script, never truncate.";
    }

    private static GenerateCodeResponseDto ParseResponse(string text)
    {
        var steps = GetDefaultSteps();
        var tsx = "// No TSX block in response.";
        var html = "<!-- No HTML block in response. -->";

        var jsonMatch = Regex.Match(text, @"```json\s*([\s\S]*?)```");
        if (jsonMatch.Success)
        {
            try
            {
                var parsed = JsonDocument.Parse(jsonMatch.Groups[1].Value.Trim());
                if (parsed.RootElement.TryGetProperty("steps", out var stepsEl) && stepsEl.ValueKind == JsonValueKind.Array)
                {
                    var list = new List<string>();
                    foreach (var el in stepsEl.EnumerateArray())
                    {
                        if (el.ValueKind == JsonValueKind.String)
                            list.Add(el.GetString() ?? "");
                    }
                    if (list.Count >= 4)
                        steps = list.Take(4).ToList();
                }
            }
            catch { /* use default steps */ }
        }

        var tsxMatch = Regex.Match(text, @"```(?:tsx|ts|jsx|js|typescript)\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
        if (tsxMatch.Success)
            tsx = tsxMatch.Groups[1].Value.Trim();

        var htmlMatch = Regex.Match(text, @"```html\s*([\s\S]*?)```", RegexOptions.IgnoreCase);
        if (htmlMatch.Success)
            html = htmlMatch.Groups[1].Value.Trim();

        return new GenerateCodeResponseDto { Steps = steps, Tsx = tsx, Html = html };
    }

    private static List<string> GetDefaultSteps()
    {
        return new List<string>
        {
            "Analyzing your prompt and designing component structure.",
            "Creating components: forms, validation, and layout.",
            "Generating React (TSX) and HTML code.",
            "Applying design system. Ready for preview."
        };
    }
}
