import api from './api';
import { getContent } from './projectService';

export interface SaveProjectOutputPayload {
  generatedTsx?: string;
  generatedHtml?: string;
  systemPrompt?: string;
  userPrompt?: string;
  taskStatus?: string;
  stepOutput?: string;
  promptHistory?: string;
  generatedPreviewImage?: string;
}

export interface ProjectOutputDto {
  id?: string;
  Id?: string;
  projectId?: string;
  version?: string;
  status?: string;
  createdAt?: string;
  CreatedAt?: string;
  systemPrompt?: string;
  generatedTsx?: string;
  generatedHtml?: string;
  stepOutput?: string;
}

const projectOutputService = {
  /**
   * Lấy tất cả output của project (để scroll xem toàn bộ log), sort mới nhất trước.
   */
  getOutputsByProjectId: (projectId: string, pageSize = 100) => {
    const params = new URLSearchParams({
      projectId,
      pageIndex: '1',
      pageSize: String(pageSize),
      sortBy: 'CreatedAt',
      sortOrder: 'desc',
    });
    return api.get<{ content: { TotalItems?: ProjectOutputDto[]; totalItems?: ProjectOutputDto[] } }>(
      `/api/ProjectOutput?${params.toString()}`
    ).then((res) => {
      const content = getContent(res.data) as { TotalItems?: ProjectOutputDto[]; totalItems?: ProjectOutputDto[] } | undefined;
      const list = Array.isArray(content?.TotalItems) ? content.TotalItems : Array.isArray(content?.totalItems) ? content.totalItems : [];
      return list;
    });
  },

  /**
   * Lấy output mới nhất của project (để hiển thị lại code, status, createdAt khi mở Editor từ Dashboard).
   */
  getLatestByProjectId: (projectId: string) => {
    return projectOutputService.getOutputsByProjectId(projectId, 1).then((list) => list[0] ?? null);
  },

  /**
   * Lưu kết quả generate (code, html, preview, task status, step output, tất cả prompt) vào project_outputs.
   * Mỗi lần gọi tạo một bản ghi mới (version).
   */
  saveOutput: (projectId: string, payload: SaveProjectOutputPayload) => {
    const body: Record<string, unknown> = {};
    if (payload.generatedTsx != null) body.generatedTsx = payload.generatedTsx;
    if (payload.generatedHtml != null) body.generatedHtml = payload.generatedHtml;
    if (payload.systemPrompt != null) body.systemPrompt = payload.systemPrompt;
    if (payload.userPrompt != null) body.userPrompt = payload.userPrompt;
    if (payload.taskStatus != null) body.taskStatus = payload.taskStatus;
    if (payload.stepOutput != null) body.stepOutput = payload.stepOutput;
    if (payload.promptHistory != null) body.promptHistory = payload.promptHistory;
    if (payload.generatedPreviewImage != null) body.generatedPreviewImage = payload.generatedPreviewImage;
    return api.post<{ content: unknown }>(
      `/api/ProjectOutput/save?projectId=${encodeURIComponent(projectId)}`,
      body
    );
  },
};

export default projectOutputService;
