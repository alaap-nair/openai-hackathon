import { OpenAIService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('OpenAIService', () => {
  let service: OpenAIService;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new OpenAIService('test-api-key');
    mockFetch.mockClear();
  });

  describe('analyze', () => {
    it('should make a POST request to analyze endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ streamId: 'test-stream-id' }),
      };
      
      const mockStreamResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content": "Test response", "done": true}\n\n')
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined
              })
          })
        }
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse as any)
        .mockResolvedValueOnce(mockStreamResponse as any);

      const result = await service.analyze('test equation', 'explain');

      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify({
          text: 'test equation',
          mode: 'explain'
        })
      });

      expect(result).toBe('Test response');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(service.analyze('test', 'explain')).rejects.toThrow('HTTP error! status: 500');
    });

    it('should work with different modes', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ streamId: 'test-stream-id' }),
      };
      
      const mockStreamResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content": "Quiz question", "done": true}\n\n')
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined
              })
          })
        }
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse as any)
        .mockResolvedValueOnce(mockStreamResponse as any);

      const result = await service.analyze('test equation', 'quiz');

      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: JSON.stringify({
          text: 'test equation',
          mode: 'quiz'
        })
      });

      expect(result).toBe('Quiz question');
    });
  });

  describe('setApiKey', () => {
    it('should update the API key', () => {
      service.setApiKey('new-key');
      
      const mockResponse = {
        ok: true,
        json: async () => ({ streamId: 'test-stream-id' }),
      };
      
      const mockStreamResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content": "Test", "done": true}\n\n')
              })
              .mockResolvedValueOnce({
                done: true,
                value: undefined
              })
          })
        }
      };

      mockFetch
        .mockResolvedValueOnce(mockResponse as any)
        .mockResolvedValueOnce(mockStreamResponse as any);

      service.analyze('test', 'explain');

      expect(mockFetch).toHaveBeenCalledWith('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer new-key'
        },
        body: JSON.stringify({
          text: 'test',
          mode: 'explain'
        })
      });
    });
  });

  describe('constructor', () => {
    it('should work without API key', () => {
      const serviceWithoutKey = new OpenAIService();
      expect(serviceWithoutKey).toBeDefined();
    });

    it('should work with custom base URL', () => {
      const serviceWithCustomUrl = new OpenAIService('key', 'https://custom.api.com');
      expect(serviceWithCustomUrl).toBeDefined();
    });
  });
}); 