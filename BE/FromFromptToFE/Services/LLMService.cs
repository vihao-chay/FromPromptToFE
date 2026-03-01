using System.Collections.Generic;
using System.Threading.Tasks;
using FromFromptToFE.Services.Interfaces;

namespace FromFromptToFE.Services
{
    public class LLMService : ILLMService
    {
        public async Task<List<GeneratedPageMock>> GeneratePagesMockAsync(string systemPrompt, string entitySchema, string projectType)
        {
            // Simulate AI processing time
            await Task.Delay(3000);

            // Return mock generated pages based on a presumed User entity
            var pages = new List<GeneratedPageMock>
            {
                new GeneratedPageMock { Route = "/", PageType = "Dashboard", EntityName = "System" },
                new GeneratedPageMock { Route = "/users", PageType = "List", EntityName = "User" },
                new GeneratedPageMock { Route = "/users/create", PageType = "CreateForm", EntityName = "User" },
                new GeneratedPageMock { Route = "/users/{id}/edit", PageType = "EditForm", EntityName = "User" }
            };

            return pages;
        }
    }
}
