using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace FromFromptToFE.Swagger
{
    /// <summary>
    /// Thêm enum (asc, desc) cho SortOrder và danh sách giá trị gợi ý cho SortBy trong Swagger.
    /// </summary>
    public class SortSchemaFilter : ISchemaFilter
    {
        private static readonly IOpenApiAny[] SortOrderEnum = new IOpenApiAny[]
        {
            new OpenApiString("asc"),
            new OpenApiString("desc")
        };

        private static readonly Dictionary<string, string[]> SortByOptions = new()
        {
            { "ProjectFilterDto", new[] { "Name", "CreatedAt", "ProjectType" } },
            { "OrganizationFilterDto", new[] { "Name", "CreatedAt", "Plan" } },
            { "ApiSpecFilterDto", new[] { "SpecType", "CreatedAt" } },
            { "ChangeLogFilterDto", new[] { "CreatedAt", "Action", "EntityType" } },
            { "ProjectOutputFilterDto", new[] { "Version", "Status", "CreatedAt" } },
            { "PageFilterDto", new[] { "Route", "PageType", "EntityName", "CreatedAt" } }
        };

        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema?.Properties == null || schema.Properties.Count == 0)
                return;

            var typeName = context.Type.Name;

            // SortOrder: luôn (asc, desc)
            SetEnumForProperty(schema, "SortOrder", "sortOrder", SortOrderEnum);

            // SortBy: theo từng DTO
            if (SortByOptions.TryGetValue(typeName, out var sortByValues))
            {
                var enumAny = sortByValues.Select(v => (IOpenApiAny)new OpenApiString(v)).ToArray();
                SetEnumForProperty(schema, "SortBy", "sortBy", enumAny);
            }
        }

        private static void SetEnumForProperty(OpenApiSchema schema, string pascalKey, string camelKey, IOpenApiAny[] enumValues)
        {
            string? key = null;
            if (schema.Properties.ContainsKey(camelKey)) key = camelKey;
            else if (schema.Properties.ContainsKey(pascalKey)) key = pascalKey;
            if (key == null) return;

            schema.Properties[key].Enum = new List<IOpenApiAny>(enumValues);
            schema.Properties[key].Description ??= (key == "sortOrder" || key == "SortOrder")
                ? "Thứ tự sắp xếp: asc | desc"
                : "Trường sắp xếp (chọn trong danh sách)";
        }
    }
}
