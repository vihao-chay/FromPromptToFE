using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace FromFromptToFE.Swagger
{
    /// <summary>
    /// Gán enum (asc, desc) cho tham số SortOrder và giá trị gợi ý cho SortBy ngay trên từng operation (query params).
    /// </summary>
    public class SortParameterOperationFilter : IOperationFilter
    {
        private static readonly IOpenApiAny[] SortOrderEnum = new IOpenApiAny[]
        {
            new OpenApiString("asc"),
            new OpenApiString("desc")
        };

        /// <summary>Map path/controller -> các giá trị SortBy. Key là phần cuối của path (Project, Organization, ...).</summary>
        private static readonly Dictionary<string, string[]> SortByByPath = new()
        {
            { "Project", new[] { "Name", "CreatedAt", "ProjectType" } },
            { "Organization", new[] { "Name", "CreatedAt", "Plan" } },
            { "ApiSpec", new[] { "SpecType", "CreatedAt" } },
            { "ChangeLog", new[] { "CreatedAt", "Action", "EntityType" } },
            { "ProjectOutput", new[] { "Version", "Status", "CreatedAt" } },
            { "Page", new[] { "Route", "PageType", "EntityName", "CreatedAt" } }
        };

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.Parameters == null) return;

            if (!context.ApiDescription.ActionDescriptor.RouteValues.TryGetValue("controller", out var controller))
                controller = context.ApiDescription.RelativePath?.Split('/').LastOrDefault() ?? "";

            foreach (var parameter in operation.Parameters)
            {
                var name = parameter.Name;
                if (string.IsNullOrEmpty(name)) continue;

                if (name.Equals("SortOrder", System.StringComparison.OrdinalIgnoreCase))
                {
                    parameter.Description = "Thứ tự sắp xếp: asc | desc";
                    parameter.Schema ??= new OpenApiSchema { Type = "string" };
                    parameter.Schema.Enum = new List<IOpenApiAny>(SortOrderEnum);
                }
                else if (name.Equals("SortBy", System.StringComparison.OrdinalIgnoreCase) && SortByByPath.TryGetValue(controller ?? "", out var sortByValues))
                {
                    parameter.Description = "Trường sắp xếp: " + string.Join(", ", sortByValues);
                    parameter.Schema ??= new OpenApiSchema { Type = "string" };
                    parameter.Schema.Enum = sortByValues.Select(v => (IOpenApiAny)new OpenApiString(v)).ToList();
                }
            }
        }
    }
}
