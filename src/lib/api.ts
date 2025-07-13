interface AnalyzeRequest {
  text: string;
  mode: 'explain' | 'quiz' | 'summarize';
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;
  private lastCallTime: number = 0;
  private minIntervalMs: number = 2000; // Minimum 2 seconds between calls

  constructor(apiKey: string = '', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyze(text: string, mode: 'explain' | 'quiz' | 'summarize'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    // Rate limiting: ensure minimum time between calls
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastCall;
      throw new Error(`Rate limit: Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request`);
    }

    const prompts = {
      explain: `Please explain this math problem step by step:\n\n${text}`,
      quiz: `Based on this math content, generate a practice question:\n\n${text}`,
      summarize: `Please provide a concise summary of this math content:\n\n${text}`
    };

    try {
      this.lastCallTime = now;
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
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
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) : 60;
          throw new Error(`Rate limited by OpenAI. Please wait ${waitTime} seconds before trying again.`);
        }
        
        // Handle other API errors
        const errorMessage = errorData.error?.message || 'Unknown error';
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          throw new Error('OpenAI rate limit exceeded. Please wait a few minutes before trying again.');
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
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