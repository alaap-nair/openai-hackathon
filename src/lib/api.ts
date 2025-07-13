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

    const prompts = {
      explain: `Please explain this math problem step by step:\n\n${text}`,
      quiz: `Based on this math content, generate a practice question:\n\n${text}`,
      summarize: `Please provide a concise summary of this math content:\n\n${text}`
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
              content: 'You are a helpful math tutor. Provide clear, concise explanations suitable for students.'
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