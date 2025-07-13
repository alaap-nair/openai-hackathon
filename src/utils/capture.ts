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
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      // Get available screen sources
      const sources = await window.electronAPI.getDesktopSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1920, height: 1080 }
      });

      if (sources.length === 0) {
        throw new Error('No screen sources available');
      }

      // Use the first screen source (primary display)
      const screenSource = sources.find(source => source.name === 'Entire Screen') || sources[0];
      
      // Get media stream from desktop capturer
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screenSource.id,
            minWidth: 1280,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080
          }
        } as any
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
      console.error('Electron screen capture failed:', error);
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
      this.stopContinuousCapture();
      throw error;
    }
  }

  private async startContinuousCaptureElectron(
    intervalMs: number,
    onCapture: (result: CaptureResult) => void,
    options: CaptureOptions
  ): Promise<void> {
    this.isCapturing = true;

    // Set up interval to capture frames
    this.captureInterval = window.setInterval(async () => {
      try {
        const result = await this.captureScreenElectron(options);
        onCapture(result);
      } catch (error) {
        console.error('Continuous capture error:', error);
        // Don't stop on individual errors, just log them
      }
    }, intervalMs);
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

  // OCR implementation using Tesseract.js
  async extractText(imageData: string): Promise<string> {
    try {
      console.log('Starting OCR process...');
      
      // Check if we're in Electron environment
      const isElectron = !!(window as any).electronAPI?.isElectron;
      console.log('Environment check - Electron:', isElectron);
      
      // Use CDN version for Electron to avoid require() issues
      if (isElectron) {
        return await this.extractTextWithCDN(imageData);
      } else {
        return await this.extractTextWithNPM(imageData);
      }
      
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

  // OCR using CDN version (for Electron)
  private async extractTextWithCDN(imageData: string): Promise<string> {
    console.log('Using CDN version of Tesseract.js for Electron...');
    
    // Load Tesseract.js from CDN
    if (!(window as any).Tesseract) {
      console.log('Loading Tesseract.js from CDN...');
      await this.loadTesseractFromCDN();
    }
    
    const Tesseract = (window as any).Tesseract;
    console.log('Creating Tesseract worker...');
    
    const worker = await Tesseract.createWorker('eng');
    
    console.log('Worker created, configuring parameters...');
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-*/=()[]{}^√∫∑∏∞<>≤≥≠±÷×πθαβγδεφψωλμσρτΩΔΠΦΨΩ.,;:!? ',
      tessedit_pageseg_mode: '6'
    });
    
    console.log('Performing OCR on image...');
    const result = await worker.recognize(imageData);
    const text = result.data.text;
    
    console.log('OCR completed, terminating worker...');
    await worker.terminate();
    
    const extractedText = text.trim();
    console.log('OCR extracted text:', extractedText);
    
    if (!extractedText) {
      return 'No text detected in image. Try positioning the content more clearly in the captured area.';
    }
    
    return extractedText;
  }

  // OCR using NPM version (for web)
  private async extractTextWithNPM(imageData: string): Promise<string> {
    console.log('Using NPM version of Tesseract.js for web...');
    
    // Import Tesseract.js dynamically
    console.log('Importing Tesseract.js...');
    const Tesseract = await import('tesseract.js');
    console.log('Tesseract.js imported successfully');
    
    // Create worker with better error handling
    console.log('Creating Tesseract worker...');
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => console.log('Tesseract logger:', m)
    });
    
    console.log('Worker created successfully, configuring parameters...');
    
    // Configure OCR to recognize text and mathematical symbols
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-*/=()[]{}^√∫∑∏∞<>≤≥≠±÷×πθαβγδεφψωλμσρτΩΔΠΦΨΩ.,;:!? ',
      tessedit_pageseg_mode: '6' // Uniform block of text
    });
    
    console.log('Parameters set, performing OCR on image...');
    
    // Perform OCR on the image
    const result = await worker.recognize(imageData);
    const text = result.data.text;
    
    console.log('OCR completed, terminating worker...');
    
    // Terminate the worker to free up resources
    await worker.terminate();
    
    const extractedText = text.trim();
    console.log('OCR extracted text:', extractedText);
    
    if (!extractedText) {
      return 'No text detected in image. Try positioning the content more clearly in the captured area.';
    }
    
    return extractedText;
  }

  // Load Tesseract.js from CDN
  private async loadTesseractFromCDN(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.onload = () => {
        console.log('Tesseract.js loaded from CDN');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Tesseract.js from CDN');
        reject(new Error('Failed to load Tesseract.js from CDN'));
      };
      document.head.appendChild(script);
    });
  }
}

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