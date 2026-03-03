using FromFromptToFE.DTOs.CodeGen;

namespace FromFromptToFE.Services.Interfaces;

public interface ICodeGenService
{
    Task<GenerateCodeResponseDto> GenerateAsync(GenerateCodeRequestDto request, CancellationToken cancellationToken = default);
}
