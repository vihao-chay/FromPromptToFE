using System;
using System.Collections.Generic;

namespace FromFromptToFE.Base;

public class PagingResult<T>
{
    public List<T> TotalItems { get; set; } = new List<T>();
    public int PageSize { get; set; }
    public int PageIndex { get; set; }
    public int TotalRow { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalRow / PageSize) : 0;
}