import { getScreenCapture, ScreenCapture } from '../capture';

// Mock browser APIs
const mockGetDisplayMedia = jest.fn();
const mockTrack = {
  stop: jest.fn(),
  onended: null as any
};

const mockStream = {
  getTracks: jest.fn(() => [mockTrack]),
  getVideoTracks: jest.fn(() => [mockTrack])
};

const mockVideo = {
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  remove: jest.fn(),
  onloadedmetadata: null as any,
  onerror: null as any,
  videoWidth: 1920,
  videoHeight: 1080,
  srcObject: null as any,
  style: { display: '' }
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data'),
};

const mockContext = {
  drawImage: jest.fn(),
};

// Mock DOM methods
Object.defineProperty(global, 'navigator', {
  value: {
    mediaDevices: {
      getDisplayMedia: mockGetDisplayMedia,
    },
  },
  writable: true,
});

// Mock document.createElement and document.body.appendChild
const originalCreateElement = document.createElement;
const originalAppendChild = document.body.appendChild;

beforeAll(() => {
  document.createElement = jest.fn((tagName) => {
    if (tagName === 'canvas') {
      return mockCanvas as any;
    }
    if (tagName === 'video') {
      return mockVideo as any;
    }
    return originalCreateElement.call(document, tagName);
  });
  
  document.body.appendChild = jest.fn();
});

afterAll(() => {
  document.createElement = originalCreateElement;
  document.body.appendChild = originalAppendChild;
});

describe('ScreenCapture', () => {
  let screenCapture: ScreenCapture;

  beforeEach(() => {
    jest.clearAllMocks();
    screenCapture = new ScreenCapture();
    mockGetDisplayMedia.mockResolvedValue(mockStream);
    mockCanvas.getContext.mockReturnValue(mockContext);
    mockVideo.play.mockResolvedValue(undefined);
  });

  describe('captureScreen', () => {
    it('should capture screen successfully', async () => {
      const result = await screenCapture.captureScreen();

      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: {
          width: { max: 1920 },
          height: { max: 1080 }
        }
      });

      expect(result).toEqual({
        imageData: 'data:image/png;base64,mock-image-data',
        timestamp: expect.any(Number),
        width: 1920,
        height: 1080
      });
    });

    it('should handle capture errors', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Permission denied'));

      await expect(screenCapture.captureScreen()).rejects.toThrow('Permission denied');
    });

    it('should throw error when screen capture not supported', async () => {
      // Save original value
      const originalMediaDevices = global.navigator.mediaDevices;
      
      // Mock undefined mediaDevices
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: undefined,
        configurable: true,
        writable: true
      });

      await expect(screenCapture.captureScreen()).rejects.toThrow('Screen capture not supported');

      // Restore original value
      Object.defineProperty(global.navigator, 'mediaDevices', {
        value: originalMediaDevices,
        configurable: true,
        writable: true
      });
    });
  });

  describe('startContinuousCapture', () => {
    it('should start continuous capture successfully', async () => {
      const onCapture = jest.fn();
      
      // Start capture
      await screenCapture.startContinuousCapture(1000, onCapture);

      expect(mockGetDisplayMedia).toHaveBeenCalled();
      expect(screenCapture.isCurrentlyCapturing()).toBe(true);
      expect(mockVideo.play).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockVideo);

      // Simulate metadata loading
      if (mockVideo.onloadedmetadata) {
        mockVideo.onloadedmetadata();
      }

      // Wait for interval to trigger
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(onCapture).toHaveBeenCalled();
    });

    it('should handle start capture errors', async () => {
      mockGetDisplayMedia.mockRejectedValue(new Error('Permission denied'));
      const onCapture = jest.fn();

      await expect(screenCapture.startContinuousCapture(1000, onCapture)).rejects.toThrow('Permission denied');
      expect(screenCapture.isCurrentlyCapturing()).toBe(false);
    });

    it('should stop previous capture when starting new one', async () => {
      const onCapture = jest.fn();
      
      // Start first capture
      await screenCapture.startContinuousCapture(1000, onCapture);
      expect(screenCapture.isCurrentlyCapturing()).toBe(true);

      // Start second capture
      await screenCapture.startContinuousCapture(1000, onCapture);
      expect(screenCapture.isCurrentlyCapturing()).toBe(true);
      expect(mockGetDisplayMedia).toHaveBeenCalledTimes(2);
    });
  });

  describe('stopContinuousCapture', () => {
    it('should stop continuous capture', async () => {
      const onCapture = jest.fn();
      
      await screenCapture.startContinuousCapture(1000, onCapture);
      expect(screenCapture.isCurrentlyCapturing()).toBe(true);

      screenCapture.stopContinuousCapture();
      expect(screenCapture.isCurrentlyCapturing()).toBe(false);
      expect(mockTrack.stop).toHaveBeenCalled();
      expect(mockVideo.pause).toHaveBeenCalled();
      expect(mockVideo.remove).toHaveBeenCalled();
    });

    it('should handle stopping when not capturing', () => {
      expect(() => screenCapture.stopContinuousCapture()).not.toThrow();
      expect(screenCapture.isCurrentlyCapturing()).toBe(false);
    });
  });

  describe('extractText', () => {
    it('should extract text from image data (placeholder)', async () => {
      const imageData = 'data:image/png;base64,mock-data';
      const result = await screenCapture.extractText(imageData);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getScreenCapture', () => {
    it('should return singleton instance', () => {
      const instance1 = getScreenCapture();
      const instance2 = getScreenCapture();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ScreenCapture);
    });
  });
}); 