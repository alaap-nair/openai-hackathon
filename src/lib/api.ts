interface AnalyzeRequest {
  text: string;
  mode: 'explain' | 'quiz' | 'summarize';
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = '', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyze(text: string, mode: 'explain' | 'quiz' | 'summarize'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    const systemPrompt = `You are a helpful math tutor analyzing text captured from a computer screen via OCR. 

IMPORTANT: The text below contains mixed content from screen capture including:
- UI elements, menus, and application text
- Browser content and navigation elements  
- Possibly some math problems, equations, or mathematical content

Your task:
1. IGNORE all non-mathematical content (UI text, menus, timestamps, etc.)
2. IDENTIFY any mathematical content (equations, problems, formulas, etc.)
3. If you find mathematical content, focus ONLY on that for your response
4. If NO clear mathematical content is found, politely explain this

Be concise and helpful. Focus only on the mathematics, not the screen noise.`;

    const prompts = {
      explain: `From the screen capture text below, find any math problems or equations and explain them step by step. If no clear math content is found, let me know.

Screen capture text:
${text}`,
      quiz: `From the screen capture text below, identify any mathematical content and create a similar practice question. If no clear math content is found, let me know.

Screen capture text:
${text}`,
      summarize: `From the screen capture text below, identify and summarize any mathematical concepts or problems. If no clear math content is found, let me know.

Screen capture text:
${text}`
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompts[mode]
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
}

export const openaiService = new OpenAIService(); 