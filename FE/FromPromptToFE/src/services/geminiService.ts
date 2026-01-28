// Đảm bảo bạn đã cài đặt: npm install @google/generative-ai
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateCode(uiPrompt: string, schemaPrompt: string) {
  // 1. Kiểm tra API Key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Vui lòng kiểm tra file .env");
  }

  // 2. Khởi tạo AI
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Sử dụng model 'gemini-1.5-flash' - đây là định danh chuẩn hiện tại
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: {
      temperature: 0.7,
    }
  });

  const prompt = `
    As a world-class senior frontend engineer, generate a React component based on the following:
    
    UI Description: ${uiPrompt}
    Data Schema/Logic: ${schemaPrompt}
    
    Requirements:
    - Use React 18+ and TypeScript.
    - Use Tailwind CSS for styling.
    - Provide the complete code for a single file component.
    - Do not include explanations, just the code block.
  `;

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      // 3. Gọi API tạo nội dung
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return text || '// Error: No code generated';
      
    } catch (error: any) {
      // Kiểm tra lỗi giới hạn lượt gọi (Rate Limit)
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isRateLimit && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delayMs = Math.pow(2, attempt) * 2000; 
        console.warn(`Đang thử lại lần ${attempt}/${MAX_RETRIES} sau ${delayMs}ms do chạm giới hạn...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }

      console.error("Gemini Generation Error:", error);
      return `// Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
  return '// Error: Thất bại sau nhiều lần thử lại.';
}