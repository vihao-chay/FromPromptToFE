using System.Collections.Generic;
using System.Threading.Tasks;

namespace FromFromptToFE.Services.Interfaces
{
    public interface ILLMService
    {
        Task<List<GeneratedPageMock>> GeneratePagesMockAsync(string systemPrompt, string entitySchema, string projectType);
    }

    public class GeneratedPageMock
    {
        public string Route { get; set; } = string.Empty;
        public string PageType { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
    }
}
