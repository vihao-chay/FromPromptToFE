# Phân tích & API: Prompt AI sinh code FE (Gemini)

## 1. Tổng quan dự án BE

- **Project**: FromFromptToFE (ASP.NET Core 8, PostgreSQL).
- **Luồng hiện tại**: Project có `SystemPrompt`, `EntitySchema`, `ProjectType` → gọi LLM → sinh danh sách **pages** (route, pageType, entityName) → lưu vào **ProjectOutput** và **Page**.

## 2. Các API cần có để hoàn thiện “prompt → sinh code FE”

### 2.1. Đã triển khai trong repo

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| **GET** | `/api/ProjectOutput?projectId={guid}` | Lấy danh sách output (các lần generate) theo project. Cần **Bearer JWT**. |
| **GET** | `/api/ProjectOutput/{id}` | Lấy chi tiết một output (kèm danh sách pages). Cần **Bearer JWT**. |
| **POST** | `/api/ProjectOutput/generate?projectId={guid}` | Gọi Gemini sinh danh sách pages cho project; user lấy từ JWT. Cần **Bearer JWT**. |

### 2.2. Cách gọi từ Frontend

- **Trigger sinh code**:  
  `POST /api/ProjectOutput/generate?projectId=<projectId>`  
  Header: `Authorization: Bearer <access_token>`
- **Xem danh sách output**:  
  `GET /api/ProjectOutput?projectId=<projectId>`  
  Header: `Authorization: Bearer <access_token>`
- **Xem chi tiết output (kèm pages)**:  
  `GET /api/ProjectOutput/<outputId>`  
  Header: `Authorization: Bearer <access_token>`

## 3. Tích hợp Gemini AI

- **Package**: `Google.GenAI` (đã thêm vào `.csproj`).
- **Cấu hình** trong `appsettings.json`:
  ```json
  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY",
    "Model": "gemini-2.0-flash"
  }
  ```
- **Lấy API key**: [Google AI Studio](https://aistudio.google.com/apikey) → tạo API key → điền vào `Gemini:ApiKey` (nên dùng `appsettings.Development.json` hoặc biến môi trường để tránh commit key).
- **Hành vi**:
  - Nếu **có ApiKey hợp lệ**: `LLMService` gọi Gemini với system prompt + user prompt (systemPrompt, entitySchema, projectType), yêu cầu trả về JSON mảng các page `{ route, pageType, entityName }`, parse và lưu vào DB.
  - Nếu **không có hoặc key placeholder**: fallback trả về danh sách mock (Dashboard, List/CreateForm/EditForm cho User) như trước.

## 4. Mở rộng sau (sinh từng file code FE)

Hiện tại **Page** chỉ lưu metadata (Route, PageType, EntityName), **chưa lưu nội dung code** (TSX/Vue/HTML). Để “sinh code FE” đầy đủ có thể:

1. **Thêm cột** vào bảng `pages` (ví dụ `generated_code` TEXT) và property tương ứng trong model `Page`.
2. **Thêm method** trong `ILLMService`: ví dụ `Task<string> GeneratePageCodeAsync(string route, string pageType, string entityName, string projectType)` gọi Gemini với prompt “sinh code component cho route này”.
3. **Mở rộng** `ProjectOutputService.GenerateCodeAsync`: sau khi có danh sách pages, gọi lần lượt `GeneratePageCodeAsync` cho từng page và ghi vào `generated_code`.
4. **API**: ví dụ `GET /api/Page/{id}/code` hoặc trả luôn `GeneratedCode` trong DTO khi gọi `GET /api/ProjectOutput/{id}`.

## 5. Tóm tắt

- **APIs cần để hoàn thiện luồng “prompt AI sinh code FE” với Gemini**:
  - `GET /api/ProjectOutput?projectId=...` — danh sách output.
  - `GET /api/ProjectOutput/{id}` — chi tiết output + pages.
  - `POST /api/ProjectOutput/generate?projectId=...` — trigger sinh (Gemini) và lưu kết quả.
- **Cấu hình**: bắt buộc cấu hình `Gemini:ApiKey` (và tùy chọn `Gemini:Model`) để dùng Gemini thật; nếu không có key thì vẫn chạy với dữ liệu mock.
