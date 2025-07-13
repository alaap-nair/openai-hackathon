import React, { useState, useEffect } from 'react';
import { getScreenCapture } from '../utils/capture';
import { openaiService } from '../lib/api';

type Mode = 'explain' | 'quiz' | 'summarize';

interface SidebarProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isVisible, onToggleVisibility }) => {
  const [mode, setMode] = useState<Mode>('explain');
  const [isCapturing, setIsCapturing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      openaiService.setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    openaiService.setApiKey(key);
  };

  const handleStartCapture = async () => {
    try {
      setError('');
      setIsCapturing(true);
      
      const screenCapture = getScreenCapture();
      await screenCapture.startContinuousCapture(
        30000, // 30 second interval to reduce API calls significantly
        async (captureResult) => {
          try {
            setIsLoading(true);
            
            // Debug: Log what we captured
            console.log('Capture result received:', {
              timestamp: captureResult.timestamp,
              width: captureResult.width,
              height: captureResult.height,
              imageDataSize: captureResult.imageData.length,
              imageDataPrefix: captureResult.imageData.substring(0, 100)
            });
            
            // Debug: Log capture details (without downloading)
            console.log('Processing captured image:', {
              timestamp: captureResult.timestamp,
              width: captureResult.width,
              height: captureResult.height,
              imageDataSize: captureResult.imageData.length,
              isDataURL: captureResult.imageData.startsWith('data:'),
              format: captureResult.imageData.startsWith('data:') ? captureResult.imageData.split(';')[0] : 'unknown'
            });
            
            // Extract text from image (OCR)
            const extractedText = await screenCapture.extractText(captureResult.imageData);
            
            console.log('OCR extracted text:', extractedText);
            
            if (extractedText.trim()) {
              // Check if enough time has passed since last analysis
              const now = Date.now();
              const timeSinceLastAnalysis = now - lastAnalysisTime;
              const minIntervalMs = 15000; // 15 seconds minimum between analyses
              
              if (timeSinceLastAnalysis < minIntervalMs) {
                const waitTime = Math.ceil((minIntervalMs - timeSinceLastAnalysis) / 1000);
                setError(`Please wait ${waitTime} seconds before requesting another analysis.`);
                return;
              }
              
              // Send to OpenAI for analysis
              const analysisResult = await openaiService.analyze(extractedText, mode);
              setResult(analysisResult);
              setLastAnalysisTime(now);
              setError(''); // Clear any previous errors
            } else {
              setError('No text could be extracted from the captured image. Please check if screen capture is working correctly.');
            }
          } catch (error) {
            console.error('Error processing capture:', error);
            setError(error instanceof Error ? error.message : 'Unknown error');
          } finally {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error starting capture:', error);
      console.error('Error starting capture - name:', error.name);
      console.error('Error starting capture - message:', error.message);
      console.error('Error starting capture - stack:', error.stack);
      setError(error instanceof Error ? error.message : 'Failed to start capture');
      setIsCapturing(false);
    }
  };

  const handleStopCapture = () => {
    const screenCapture = getScreenCapture();
    screenCapture.stopContinuousCapture();
    setIsCapturing(false);
  };

  const handleManualCapture = async () => {
    if (!apiKey) {
      setError('Please set your OpenAI API key first');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const screenCapture = getScreenCapture();
      const captureResult = await screenCapture.captureScreen();
      
      console.log('Manual capture result:', {
        timestamp: captureResult.timestamp,
        width: captureResult.width,
        height: captureResult.height,
        imageDataSize: captureResult.imageData.length
      });
      
      // Extract text from image (OCR)
      const extractedText = await screenCapture.extractText(captureResult.imageData);
      
      console.log('OCR extracted text:', extractedText);
      
      if (extractedText.trim()) {
        // Check if enough time has passed since last analysis
        const now = Date.now();
        const timeSinceLastAnalysis = now - lastAnalysisTime;
        const minIntervalMs = 5000; // 5 seconds minimum between analyses
        
        if (timeSinceLastAnalysis < minIntervalMs) {
          const waitTime = Math.ceil((minIntervalMs - timeSinceLastAnalysis) / 1000);
          setError(`Please wait ${waitTime} seconds before requesting another analysis.`);
          return;
        }
        
        // Send to OpenAI for analysis
        const analysisResult = await openaiService.analyze(extractedText, mode);
        setResult(analysisResult);
        setLastAnalysisTime(now);
        setError(''); // Clear any previous errors
      } else {
        setError('No text could be extracted from the captured image. Please check if screen capture is working correctly.');
      }
    } catch (error) {
      console.error('Error with manual capture:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setResult(''); // Clear previous results when mode changes
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width: '384px',
      background: 'linear-gradient(to bottom, #dbeafe, #ffffff)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      borderLeft: '4px solid #3b82f6',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        background: '#eff6ff'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937'
          }}>Math Study Copilot</h1>
          <button
            onClick={onToggleVisibility}
            style={{
              padding: '8px',
              borderRadius: '4px',
              background: '#bfdbfe',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Close sidebar"
          >
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>Mode</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px'
        }}>
          {(['explain', 'quiz', 'summarize'] as Mode[]).map((modeOption) => (
            <button
              key={modeOption}
              onClick={() => handleModeChange(modeOption)}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...(mode === modeOption
                  ? {
                      background: '#3b82f6',
                      color: 'white',
                      borderColor: '#3b82f6'
                    }
                  : {
                      background: 'white',
                      color: '#374151',
                      borderColor: '#d1d5db'
                    })
              }}
            >
              {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={isCapturing ? handleStopCapture : handleStartCapture}
            disabled={!apiKey}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: '500',
              border: 'none',
              cursor: apiKey ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              ...(isCapturing
                ? {
                    background: '#ef4444',
                    color: 'white'
                  }
                : apiKey
                ? {
                    background: '#10b981',
                    color: 'white'
                  }
                : {
                    background: '#d1d5db',
                    color: '#6b7280'
                  })
            }}
          >
            {isCapturing ? 'Stop Auto Capture' : 'Start Auto Capture'}
          </button>
          
          <button
            onClick={handleManualCapture}
            disabled={!apiKey || isLoading}
            style={{
              width: '100%',
              padding: '8px 16px',
              borderRadius: '4px',
              fontWeight: '500',
              border: 'none',
              cursor: (apiKey && !isLoading) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              ...(apiKey && !isLoading
                ? {
                    background: '#3b82f6',
                    color: 'white'
                  }
                : {
                    background: '#d1d5db',
                    color: '#6b7280'
                  })
            }}
          >
            {isLoading ? 'Processing...' : 'Capture Now'}
          </button>
          
          {!apiKey && (
            <p style={{
              fontSize: '12px',
              color: '#ef4444'
            }}>Please set your OpenAI API key below</p>
          )}
        </div>
      </div>

      {/* Settings */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '8px'
        }}>
          OpenAI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            outline: 'none',
            fontSize: '14px'
          }}
          placeholder="sk-..."
        />
      </div>

      {/* Status */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isCapturing ? '#10b981' : '#d1d5db'
          }}></div>
          <span style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {isCapturing ? 'Capturing...' : 'Stopped'}
          </span>
          {isLoading && (
            <div style={{
              marginLeft: 'auto',
              width: '16px',
              height: '16px',
              border: '2px solid #3b82f6',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto'
      }}>
        {error && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#dc2626'
            }}>{error}</p>
          </div>
        )}
        
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              {mode === 'explain' ? 'Explanation' : mode === 'quiz' ? 'Quiz Question' : 'Summary'}
            </h3>
            <div style={{
              background: '#f9fafb',
              padding: '12px',
              borderRadius: '4px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#1f2937',
                whiteSpace: 'pre-wrap'
              }}>{result}</p>
            </div>
          </div>
        )}
        
        {!result && !error && (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <p>Start capturing to see AI analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}; 