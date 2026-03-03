// Code generation via Gemini REST API – auto-detect available model via List Models
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com';

/** Parse response: get steps from json block, TSX and HTML from their blocks. Never use json as code. */
function parseGeminiResponse(text: string): { steps: string[]; tsx: string; html: string } {
  const steps: string[] = [];
  let tsx = '';
  let html = '';
  const blocks = text.split('```');
  for (let i = 1; i < blocks.length; i += 2) {
    const block = blocks[i];
    const firstLineEnd = block.indexOf('\n');
    const firstLine = (firstLineEnd >= 0 ? block.slice(0, firstLineEnd) : block).trim().toLowerCase();
    const content = (firstLineEnd >= 0 ? block.slice(firstLineEnd + 1) : '').trim();
    if (firstLine.startsWith('json')) {
      try {
        const parsed = JSON.parse(content) as { steps?: unknown };
        if (Array.isArray(parsed.steps) && parsed.steps.length >= 4)
          parsed.steps.slice(0, 4).forEach((s) => steps.push(typeof s === 'string' ? s : String(s)));
      } catch { /* ignore */ }
    } else if (/^(tsx|ts|jsx|js|typescript)(\s|$)/.test(firstLine)) {
      if (!tsx) tsx = content;
    } else if (firstLine.startsWith('html')) {
      if (!html) html = content;
    }
  }
  return { steps, tsx, html };
}

export interface GeneratedCodes {
  tsx: string;
  html: string;
  steps?: string[];
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
        maxOutputTokens: 16384,
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

OUTPUT EXACTLY THREE BLOCKS in this order:

1) A JSON block with exactly 4 step descriptions in the SAME language as the user's "System Prompt" above (Vietnamese prompt → Vietnamese; English → English). Format:
\`\`\`json
{"steps": ["First step.", "Second step.", "Third step.", "Fourth step."]}
\`\`\`

2) React + TypeScript (TSX) – one component file, Tailwind CSS, default export. Use comments in the SAME language as the user's prompt. Output COMPLETE full code – do not abbreviate or shorten.
\`\`\`tsx
... your full TSX code ...
\`\`\`

3) Standalone HTML – same layout and style, one full HTML file with <!DOCTYPE html>, Tailwind via CDN or <style>. Use comments in the SAME language as the user's prompt. Output COMPLETE full code – do not abbreviate or shorten.
\`\`\`html
... your full HTML code ...
\`\`\`

Requirements: Same UI and styling in both; same language as the user prompt for steps and all comments; output ONLY these three blocks (json, tsx, html), no other text. Output full script, never truncate.`;

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
        const { steps: parsedSteps, tsx, html } = parseGeminiResponse(text);
        return {
          tsx: tsx || '// No TSX block in response.',
          html: html || '<!-- No HTML block in response. -->',
          steps: parsedSteps.length >= 4 ? parsedSteps : undefined,
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
