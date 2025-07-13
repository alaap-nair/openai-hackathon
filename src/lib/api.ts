export class OpenAIService {
  private apiKey: string;
  private baseUrl: string;
  private lastCallTime: number = 0;
  private minIntervalMs: number = 5000; // Minimum 5 seconds between calls
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(apiKey: string = '', baseUrl: string = 'https://api.openai.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async analyze(text: string, mode: 'explain' | 'quiz' | 'summarize'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set');
    }

    // Rate limiting: ensure minimum time between calls with exponential backoff
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    const requiredInterval = this.minIntervalMs * Math.pow(2, this.retryCount);
    
    if (timeSinceLastCall < requiredInterval) {
      const waitTime = requiredInterval - timeSinceLastCall;
      throw new Error(`Rate limit: Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request`);
    }

    const prompts = {
      explain: `Please explain this math problem step by step. Format all mathematical expressions cleanly without any special characters (no $$, \\, #, or []). Present steps clearly with numbers (1., 2., etc.) instead of markdown headers:\n\n${text}`,
      quiz: `Based on this math content, generate a practice question. Format all mathematical expressions cleanly without any special characters (no $$, \\, #, or []). Present steps clearly with numbers (1., 2., etc.) instead of markdown headers:\n\n${text}`,
      summarize: `Please provide a concise summary of this math content. Format all mathematical expressions cleanly without any special characters (no $$, \\, #, or []). Present points clearly with numbers (1., 2., etc.) instead of markdown headers:\n\n${text}`
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
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are Observer, an expert math tutor. You analyze text extracted from screens and help students understand math problems.\n\nFocus ONLY on mathematical content. Ignore UI elements, menus, or non-math text.\n\nBased on the mode:\n- Explain: Provide step-by-step explanations with clear reasoning\n- Quiz: Generate practice questions or check answers if provided\n- Summarize: Give concise concept summaries\n\nAlways:\n- Be direct and concise\n- Format all mathematical expressions cleanly without special characters (no $$, \\, #, or [])\n- Use simple numbers (1., 2., etc.) for steps instead of markdown headers\n- Point out mistakes gently if you see them\n- If no math is detected, say "No math content found to analyze"\n\nFormat responses clearly and avoid mentioning OCR, screenshots, or that you are an AI.'
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
          this.retryCount = Math.min(this.retryCount + 1, this.maxRetries);
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) : 60;
          throw new Error(`Rate limited by OpenAI. Please wait ${waitTime} seconds before trying again.`);
        }
        
        // Handle other API errors
        const errorMessage = errorData.error?.message || 'Unknown error';
        if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
          this.retryCount = Math.min(this.retryCount + 1, this.maxRetries);
          throw new Error('OpenAI rate limit exceeded. Please wait a few minutes before trying again.');
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }

      // Reset retry count on successful call
      this.retryCount = 0;
      
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