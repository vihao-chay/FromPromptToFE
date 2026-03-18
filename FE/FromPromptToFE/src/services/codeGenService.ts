import api from './api';
import { generateCodeFromInputs } from './geminiService';

export interface GenerateCodeRequest {
  systemPrompt: string;
  erdSchema: string;
  apiSpec: string;
  designSystem: string;
}

export interface GenerateCodeResponse {
  steps: string[];
  tsx: string;
  html: string;
}

export async function generateCode(request: GenerateCodeRequest): Promise<GenerateCodeResponse> {
  try {
    const res = await api.post<{ content?: GenerateCodeResponse }>('/api/code-gen', {
      systemPrompt: request.systemPrompt,
      erdSchema: request.erdSchema,
      apiSpec: request.apiSpec,
      designSystem: request.designSystem,
    });
    const content = res.data?.content;
    if (!content) throw new Error('No content in response');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = content as any;
    const tsx = c.tsx ?? c.Tsx ?? '';
    const html = c.html ?? c.Html ?? '';
    const steps = Array.isArray(c.steps) ? c.steps : Array.isArray(c.Steps) ? c.Steps : [];
    // If BE returned error (e.g. Gemini not configured), try direct Gemini from FE when key is in .env
    if (tsx.startsWith('// Error') && import.meta.env.VITE_GEMINI_API_KEY) {
      const out = await generateCodeFromInputs({
        systemPrompt: request.systemPrompt,
        erdSchema: request.erdSchema,
        apiSpec: request.apiSpec,
        designSystem: request.designSystem,
      });
      return {
        steps: (out.steps && out.steps.length >= 4) ? out.steps : [],
        tsx: out.tsx,
        html: out.html,
      };
    }
    return {
      steps,
      tsx,
      html,
    };
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    const isServerOrNotFound = status === 404 || (status != null && status >= 500);
    const isNetwork = (err as { code?: string })?.code === 'ERR_NETWORK' || (err as Error)?.message?.includes('Network');
    if (isServerOrNotFound || isNetwork) {
      const out = await generateCodeFromInputs({
        systemPrompt: request.systemPrompt,
        erdSchema: request.erdSchema,
        apiSpec: request.apiSpec,
        designSystem: request.designSystem,
      });
      return {
        steps: (out.steps && out.steps.length >= 4) ? out.steps : [],
        tsx: out.tsx,
        html: out.html,
      };
    }
    throw err;
  }
}
