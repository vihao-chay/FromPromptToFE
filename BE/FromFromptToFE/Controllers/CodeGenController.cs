using FromFromptToFE.Base;
using FromFromptToFE.DTOs.CodeGen;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers;

[ApiController]
[Route("api/CodeGen")]
[AllowAnonymous]
public class CodeGenController : ControllerBase
{
    private readonly ICodeGenService _service;

    public CodeGenController(ICodeGenService service)
    {
        _service = service;
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "ok", service = "CodeGen" });

    [HttpPost]
    public async Task<IActionResult> Generate([FromBody] GenerateCodeRequestDto request, CancellationToken cancellationToken)
    {
        if (request == null)
            return ResponseEntity<GenerateCodeResponseDto>.Fail("Request body is required", 400);

        var result = await _service.GenerateAsync(request, cancellationToken);
        return ResponseEntity<GenerateCodeResponseDto>.Ok(result, "Generated");
    }
}
