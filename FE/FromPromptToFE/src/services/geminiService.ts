// Code generation via Gemini REST API – auto-detect available model via List Models
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com';

function extractOneBlock(text: string, lang: string): string {
  const trimmed = text.trim();
  const regex = new RegExp(`\`\`\`(?:${lang})?\\s*([\\s\\S]*?)\`\`\``);
  const m = trimmed.match(regex);
  if (m) return m[1].trim();
  return trimmed;
}

export interface GeneratedCodes {
  tsx: string;
  html: string;
}

export interface GenerateInputs {
  systemPrompt: string;
  erdSchema: string;
  apiSpec: string;
  designSystem: string;
}

/** GET list of models; return model ids that support generateContent (id = name without "models/" prefix). */
async function listModelsSupportingGenerateContent(
  apiVersion: 'v1' | 'v1beta'
): Promise<string[]> {
  const url = `${BASE}/${apiVersion}/models?key=${encodeURIComponent(API_KEY!)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const models: Array<{ name?: string; supportedGenerationMethods?: string[] }> = data.models || [];
  const ids: string[] = [];
  for (const m of models) {
    const name = m.name || '';
    const supported = m.supportedGenerationMethods || [];
    if (supported.includes('generateContent')) {
      const id = name.replace(/^models\//, '').trim();
      if (id) ids.push(id);
    }
  }
  return ids;
}

async function callGeminiREST(
  apiVersion: 'v1' | 'v1beta',
  modelId: string,
  prompt: string
): Promise<string> {
  const url = `${BASE}/${apiVersion}/models/${modelId}:generateContent?key=${encodeURIComponent(API_KEY!)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err.error || { code: res.status, message: res.statusText }));
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (text) return text;
  throw new Error('No text in response');
}

export async function generateCodeFromInputs(inputs: GenerateInputs): Promise<GeneratedCodes> {
  const { systemPrompt, erdSchema, apiSpec, designSystem } = inputs;
  const errorResult: GeneratedCodes = {
    tsx: `// Error: Missing VITE_GEMINI_API_KEY. Add it in .env:\n// VITE_GEMINI_API_KEY=your_gemini_api_key`,
    html: '<!-- Same error: add VITE_GEMINI_API_KEY in .env -->',
  };
  if (!API_KEY) return errorResult;

  const prompt = `You are a senior frontend engineer. Generate the SAME UI in TWO formats at once.

## System Prompt (main instruction)
${systemPrompt || 'A modern React UI.'}

## ERD / Schema (DBML)
${erdSchema || '(none)'}

## API Spec (OpenAPI)
${apiSpec || '(none)'}

## Design System (JSON)
${designSystem || '{}'}

OUTPUT EXACTLY TWO CODE BLOCKS in this order (no other text):

1) React + TypeScript (TSX) – one component file, Tailwind CSS, default export.
   Use this block: \`\`\`tsx
   ... your TSX code ...
   \`\`\`

2) Standalone HTML – same layout and style, one full HTML file with <!DOCTYPE html>, use Tailwind via CDN or <style> with same look.
   Use this block: \`\`\`html
   ... your HTML code ...
   \`\`\`

Requirements: Same UI and styling in both; output ONLY these two code blocks, no explanations.`;

  let lastError: unknown = null;
  for (const apiVersion of ['v1beta', 'v1'] as const) {
    const modelIds = await listModelsSupportingGenerateContent(apiVersion);
    const sorted = [...modelIds].sort((a, b) => {
      if (a.includes('flash') && !b.includes('flash')) return -1;
      if (!a.includes('flash') && b.includes('flash')) return 1;
      return 0;
    });
    for (const modelId of sorted) {
      try {
        const text = await callGeminiREST(apiVersion, modelId, prompt);
        const tsx = extractOneBlock(text, 'tsx|ts|jsx|js');
        const htmlBlock = text.match(/```html\s*([\s\S]*?)```/);
        const html = htmlBlock ? htmlBlock[1].trim() : '';
        return {
          tsx: tsx || '// No TSX block in response.',
          html: html || '<!-- No HTML block in response. -->',
        };
      } catch (err) {
        lastError = err;
        continue;
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  return {
    tsx: `// Error: ${msg}\n// Get key: https://aistudio.google.com/apikey`,
    html: `<!-- Error: ${msg} -->`,
  };
}

/** Legacy: UI + Schema only (used by Preview page). Returns TSX. */
export async function generateCode(uiPrompt: string, schemaPrompt: string): Promise<string> {
  const out = await generateCodeFromInputs({
    systemPrompt: uiPrompt,
    erdSchema: schemaPrompt,
    apiSpec: '',
    designSystem: '{}',
  });
  return out.tsx;
}
