using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FromFromptToFE.Controllers;

[ApiController]
[Route("api/codes")]
[Authorize]
public class CodeController : ControllerBase
{
    private readonly ICodeService _service;

    public CodeController(ICodeService service)
    {
        _service = service;
    }

    /// <summary>Lấy danh sách bản ghi code (phân trang, lọc theo user, status, search).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] CodeFilterDto filter)
    {
        var result = await _service.GetAllAsync(filter);
        return ResponseEntity<PagingResult<CodeDto>>.Ok(result, "Lấy danh sách code thành công");
    }

    /// <summary>Lấy một bản ghi code theo id.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var item = await _service.GetByIdAsync(id);
        if (item == null)
            return ResponseEntity<CodeDto>.Fail("Không tìm thấy bản ghi code", 404);
        return ResponseEntity<CodeDto>.Ok(item, "Lấy thông tin code thành công");
    }
}
