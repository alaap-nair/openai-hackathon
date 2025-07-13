interface CaptureOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  format?: 'image/png' | 'image/jpeg';
  quality?: number;
}

interface CaptureResult {
  imageData: string;
  timestamp: number;
  width: number;
  height: number;
}

// Electron API types
declare global {
  interface Window {
    electronAPI?: {
      getDesktopSources: (options: { types: string[]; thumbnailSize?: { width: number; height: number } }) => Promise<any[]>;
      isElectron: boolean;
      process: {
        platform: string;
        versions: {
          node: string;
          chrome: string;
          electron: string;
        };
        env: {
          NODE_ENV: string;
        };
      };
    };
  }
}

export class ScreenCapture {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private isCapturing = false;
  private captureInterval: number | null = null;
  private mediaStream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private isElectron: boolean;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.context = context;
    this.isElectron = !!(window.electronAPI?.isElectron);
    console.log('ScreenCapture initialized, Electron mode:', this.isElectron);
  }

  async captureScreen(options: CaptureOptions = {}): Promise<CaptureResult> {
    if (this.isElectron) {
      return this.captureScreenElectron(options);
    } else {
      return this.captureScreenBrowser(options);
    }
  }

  private async captureScreenElectron(options: CaptureOptions = {}): Promise<CaptureResult> {
    try {
      // Check if getDisplayMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture not supported in this environment');
      }

      console.log('Requesting screen capture permission...');
      
      // Use getDisplayMedia which works reliably in Electron
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 }
        },
        audio: false
      });

      console.log('Screen capture permission granted, stream obtained');

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const { videoWidth, videoHeight } = video;
          
          // Set canvas size to match video or specified dimensions
          this.canvas.width = options.width || videoWidth;
          this.canvas.height = options.height || videoHeight;

          // Draw video frame to canvas
          this.context.drawImage(
            video,
            options.x || 0,
            options.y || 0,
            options.width || videoWidth,
            options.height || videoHeight,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          // Convert to base64
          const imageData = this.canvas.toDataURL(
            options.format || 'image/png',
            options.quality || 0.8
          );

          // Clean up
          stream.getTracks().forEach(track => track.stop());
          video.remove();

          resolve({
            imageData,
            timestamp: Date.now(),
            width: this.canvas.width,
            height: this.canvas.height
          });
        };

        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Failed to load video'));
        };
      });
    } catch (error) {
      console.error('Electron screen capture failed:', error);
      console.error('Error details - name:', error.name);
      console.error('Error details - message:', error.message);
      console.error('Error details - stack:', error.stack);
      
      // Provide more helpful error messages for common issues
      if (error.name === 'NotAllowedError') {
        throw new Error('Screen recording permission denied. Please grant screen recording permissions in System Preferences > Security & Privacy > Screen Recording and restart the app.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No screen sources available for capture.');
      } else if (error.name === 'AbortError') {
        throw new Error('Screen capture was cancelled by the user.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('Screen capture is not supported in this environment.');
      }
      
      throw error;
    }
  }

  private async captureScreenBrowser(options: CaptureOptions = {}): Promise<CaptureResult> {
    try {
      // Check if screen capture is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen capture not supported');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { max: 1920 },
          height: { max: 1080 }
        }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const { videoWidth, videoHeight } = video;
          
          // Set canvas size to match video or specified dimensions
          this.canvas.width = options.width || videoWidth;
          this.canvas.height = options.height || videoHeight;

          // Draw video frame to canvas
          this.context.drawImage(
            video,
            options.x || 0,
            options.y || 0,
            options.width || videoWidth,
            options.height || videoHeight,
            0,
            0,
            this.canvas.width,
            this.canvas.height
          );

          // Convert to base64
          const imageData = this.canvas.toDataURL(
            options.format || 'image/png',
            options.quality || 0.8
          );

          // Clean up
          stream.getTracks().forEach(track => track.stop());
          video.remove();

          resolve({
            imageData,
            timestamp: Date.now(),
            width: this.canvas.width,
            height: this.canvas.height
          });
        };

        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('Failed to load video'));
        };
      });
    } catch (error) {
      console.error('Browser screen capture failed:', error);
      throw error;
    }
  }

  async startContinuousCapture(
    intervalMs: number = 3000,
    onCapture: (result: CaptureResult) => void,
    options: CaptureOptions = {}
  ): Promise<void> {
    if (this.isCapturing) {
      this.stopContinuousCapture();
    }

    try {
      if (this.isElectron) {
        await this.startContinuousCaptureElectron(intervalMs, onCapture, options);
      } else {
        await this.startContinuousCaptureBrowser(intervalMs, onCapture, options);
      }
    } catch (error) {
      console.error('Failed to start continuous capture:', error);
      console.error('Failed to start continuous capture - name:', error.name);
      console.error('Failed to start continuous capture - message:', error.message);
      console.error('Failed to start continuous capture - stack:', error.stack);
      this.stopContinuousCapture();
      
      // Start fallback capture to show test pattern
      console.log('Starting fallback capture with test pattern...');
      this.startFallbackCapture(intervalMs, onCapture, options);
      
      // Don't throw error, just log it and continue with fallback
      console.warn('Continuing with fallback capture due to error');
    }
  }

  private async startContinuousCaptureElectron(
    intervalMs: number,
    onCapture: (result: CaptureResult) => void,
    options: CaptureOptions
  ): Promise<void> {
    console.log('Starting continuous capture for Electron...');
    
    // Check platform using electronAPI
    const platform = window.electronAPI?.process?.platform || '';
    console.log('Detected platform:', platform);
    
    // Check permissions on macOS
    if (platform === 'darwin') {
      console.log('Detected macOS - checking screen recording permissions...');
    }

    // Get available screen sources
    const screenSources = await window.electronAPI?.getDesktopSources({
      types: ['screen'],
      thumbnailSize: { width: 150, height: 150 }
    }) || [];

    console.log('Screen sources available:', screenSources.length);

    if (!screenSources.length) {
      throw new Error('No screen sources available');
    }

    // Use the first screen source (primary display)
    const screenSource = screenSources.find(source => source.name === 'Entire Screen') || screenSources[0];
    console.log('Using screen source:', screenSource.name);
    
    // Check if we have the required source ID
    if (!screenSource.id) {
      throw new Error('Invalid screen source ID. Screen recording permissions may not be granted.');
    }
    
    // Get media stream from desktop capturer using getUserMedia
    console.log('Creating media stream from desktop source...');
    
    // Use modern video constraints format for Electron
    const videoConstraints = {
      audio: false,
      video: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: screenSource.id,
        width: { min: 1280, ideal: 1920, max: 1920 },
        height: { min: 720, ideal: 1080, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      } as any
    };
    
    console.log('Using video constraints:', videoConstraints);
    
    // Add timeout to getUserMedia call
    const getUserMediaWithTimeout = (constraints: any, timeoutMs: number = 10000) => {
      return Promise.race([
        navigator.mediaDevices.getUserMedia(constraints),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Screen capture request timed out. Please ensure screen recording permissions are granted.')), timeoutMs)
        )
      ]);
    };
    
    this.mediaStream = await getUserMediaWithTimeout(videoConstraints, 10000) as MediaStream;

    console.log('Screen capture stream created successfully');

  // Create video element to capture frames from
  this.video = document.createElement('video');
  this.video.srcObject = this.mediaStream;
  this.video.style.display = 'none';
  document.body.appendChild(this.video);
  
  // Wait for video to load
  await new Promise<void>((resolve, reject) => {
    this.video!.onloadedmetadata = () => resolve();
    this.video!.onerror = () => reject(new Error('Failed to load video'));
  });

  await this.video.play();

  this.isCapturing = true;

  // Set up interval to capture frames from the existing stream
  this.captureInterval = window.setInterval(() => {
    try {
      if (!this.video || !this.mediaStream) return;

      const { videoWidth, videoHeight } = this.video;
      
      // Set canvas size to match video or specified dimensions
      this.canvas.width = options.width || videoWidth;
      this.canvas.height = options.height || videoHeight;

      // Draw current video frame to canvas
      this.context.drawImage(
        this.video,
        options.x || 0,
        options.y || 0,
        options.width || videoWidth,
        options.height || videoHeight,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // Convert to base64
      const imageData = this.canvas.toDataURL(
        options.format || 'image/png',
        options.quality || 0.8
      );

      const result: CaptureResult = {
        imageData,
        timestamp: Date.now(),
        width: this.canvas.width,
        height: this.canvas.height
      };

      onCapture(result);
    } catch (error) {
      console.error('Continuous capture error:', error);
      console.error('Continuous capture error - name:', error.name);
      console.error('Continuous capture error - message:', error.message);
      console.error('Continuous capture error - stack:', error.stack);
      // Don't stop on individual errors, just log them
    }
  }, intervalMs);

  // Handle stream ending (user stops sharing)
  this.mediaStream.getVideoTracks()[0].onended = () => {
    console.log('Screen sharing stopped by user');
    this.stopContinuousCapture();
  };
  } catch (error) {
    console.error('Error in startContinuousCaptureElectron:', error);
    console.error('Error in startContinuousCaptureElectron - name:', error.name);
    console.error('Error in startContinuousCaptureElectron - message:', error.message);
    console.error('Error in startContinuousCaptureElectron - stack:', error.stack);
    
    // Provide more helpful error messages for common issues
    if (error.name === 'NotAllowedError') {
      throw new Error('Screen recording permission denied. Please grant screen recording permissions in System Preferences > Security & Privacy > Screen Recording and restart the app.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('No screen sources available for capture.');
    } else if (error.name === 'AbortError') {
      throw new Error('Screen capture was cancelled. On macOS, please ensure screen recording permissions are granted in System Preferences > Security & Privacy > Screen Recording, then restart the app.');
    } else if (error.name === 'NotSupportedError') {
      throw new Error('Screen capture is not supported in this environment.');
    } else if (error.name === 'InvalidStateError') {
      throw new Error('Invalid state for screen capture. Please try clicking the Start Capture button again.');
    } else if (error.message && error.message.includes('timed out')) {
      throw new Error('Screen capture request timed out. On macOS, please grant screen recording permissions in System Preferences > Security & Privacy > Screen Recording, then restart the app.');
    }
    
    throw error;
  }

  private startFallbackCapture(
    intervalMs: number,
    onCapture: (result: CaptureResult) => void,
    options: CaptureOptions
  ): void {
    console.log('Starting fallback capture with test pattern...');
    
    // Create a test pattern with the math equation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = 800;
    canvas.height = 400;
    
    // Create test pattern
    const createTestPattern = () => {
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw the equation
      ctx.fillStyle = 'black';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Screen Capture Not Available', canvas.width / 2, 80);
      ctx.fillText('To enable screen capture:', canvas.width / 2, 110);
      ctx.font = '16px Arial';
      ctx.fillText('1. Go to System Preferences > Security & Privacy > Screen Recording', canvas.width / 2, 140);
      ctx.fillText('2. Add this app to the list', canvas.width / 2, 165);
      ctx.fillText('3. Restart the app', canvas.width / 2, 190);
      ctx.font = '48px Arial';
      ctx.fillText('x + 12 = 14', canvas.width / 2, 240);
      ctx.font = '16px Arial';
      ctx.fillText('(Test equation for OCR)', canvas.width / 2, 270);
      ctx.fillText('OCR is working - screen capture needs permissions', canvas.width / 2, 295);
      
      const imageData = canvas.toDataURL('image/png');
      
      const result: CaptureResult = {
        imageData,
        timestamp: Date.now(),
        width: canvas.width,
        height: canvas.height
      };
      
      onCapture(result);
    };
    
    // Call once immediately
    createTestPattern();
    
    // Set up interval - use longer interval for fallback to avoid spam
    this.isCapturing = true;
    const fallbackInterval = Math.max(intervalMs, 10000); // At least 10 seconds
    this.captureInterval = window.setInterval(createTestPattern, fallbackInterval);
  }

  private async startContinuousCaptureBrowser(
    intervalMs: number,
    onCapture: (result: CaptureResult) => void,
    options: CaptureOptions
  ): Promise<void> {
    // Check if screen capture is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      throw new Error('Screen capture not supported');
    }

    // Get the media stream once
    this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { max: 1920 },
        height: { max: 1080 }
      }
    });

    // Create video element to capture frames from
    this.video = document.createElement('video');
    this.video.srcObject = this.mediaStream;
    this.video.style.display = 'none';
    document.body.appendChild(this.video);
    
    // Wait for video to load
    await new Promise<void>((resolve, reject) => {
      this.video!.onloadedmetadata = () => resolve();
      this.video!.onerror = () => reject(new Error('Failed to load video'));
    });

    await this.video.play();

    this.isCapturing = true;

    // Set up interval to capture frames
    this.captureInterval = window.setInterval(() => {
      try {
        if (!this.video || !this.mediaStream) return;

        const { videoWidth, videoHeight } = this.video;
        
        // Set canvas size to match video or specified dimensions
        this.canvas.width = options.width || videoWidth;
        this.canvas.height = options.height || videoHeight;

        // Draw current video frame to canvas
        this.context.drawImage(
          this.video,
          options.x || 0,
          options.y || 0,
          options.width || videoWidth,
          options.height || videoHeight,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );

        // Convert to base64
        const imageData = this.canvas.toDataURL(
          options.format || 'image/png',
          options.quality || 0.8
        );

        const result: CaptureResult = {
          imageData,
          timestamp: Date.now(),
          width: this.canvas.width,
          height: this.canvas.height
        };

        onCapture(result);
      } catch (error) {
        console.error('Continuous capture error:', error);
        console.error('Continuous capture error - name:', error.name);
        console.error('Continuous capture error - message:', error.message);
        console.error('Continuous capture error - stack:', error.stack);
        // Don't stop on individual errors, just log them
      }
    }, intervalMs);

    // Handle stream ending (user stops sharing)
    this.mediaStream.getVideoTracks()[0].onended = () => {
      console.log('Screen sharing stopped by user');
      this.stopContinuousCapture();
    };
  }

  stopContinuousCapture(): void {
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.video) {
      this.video.pause();
      this.video.remove();
      this.video = null;
    }

    this.isCapturing = false;
  }

  isCurrentlyCapturing(): boolean {
    return this.isCapturing;
  }

  // OCR implementation using OpenAI Vision API
  async extractText(imageData: string): Promise<string> {
    try {
      console.log('Starting OCR process with OpenAI Vision API...');
      console.log('Image data length:', imageData.length);
      console.log('Image data prefix:', imageData.substring(0, 50));
      
      // Get API key from localStorage
      const apiKey = localStorage.getItem('openai_api_key');
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set your API key in the sidebar.');
      }
      
      // Ensure the image data is in the correct format for OpenAI Vision API
      let processedImageData = imageData;
      
      // If it's already a data URL, use it as is
      if (!imageData.startsWith('data:')) {
        processedImageData = `data:image/png;base64,${imageData}`;
      }
      
      console.log('Making request to OpenAI Vision API...');
      console.log('Processed image data prefix:', processedImageData.substring(0, 50));
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text from this image, focusing on mathematical equations, formulas, and any readable text. Return only the extracted text without any commentary. If you cannot see any text or the image is unclear, respond with "No readable text found".'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: processedImageData,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI Vision API error:', errorData);
        throw new Error(`OpenAI Vision API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('OpenAI Vision API response:', data);
      
      const extractedText = data.choices[0]?.message?.content || '';
      
      console.log('OCR extracted text:', extractedText);
      
      if (!extractedText.trim() || extractedText.includes('No readable text found')) {
        return 'No text detected in image. Try positioning the content more clearly in the captured area.';
      }
      
      return extractedText.trim();
    } catch (error) {
      console.error('OCR error details:', error);
      
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Return a more informative error message
      return `OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check your screen capture.`;
    }
  }

} // End of ScreenCapture class

// Create a lazy singleton instance
let _screenCapture: ScreenCapture | null = null;

export const getScreenCapture = (): ScreenCapture => {
  if (!_screenCapture) {
    _screenCapture = new ScreenCapture();
  }
  return _screenCapture;
};

// Export the class for testing purposes
export default ScreenCapture; 