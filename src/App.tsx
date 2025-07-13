import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import './App.css';

// Electron API type declaration
declare global {
  interface Window {
    electronAPI?: {
      getDesktopSources: (options: { types: string[]; thumbnailSize?: { width: number; height: number } }) => Promise<any[]>;
      onToggleSidebar: (callback: () => void) => void;
      removeToggleSidebarListener: () => void;
      platform: string;
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
      versions: {
        node: string;
        chrome: string;
        electron: string;
      };
    };
  }
}

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
      
      // Listen for Electron's global shortcut
      window.electronAPI.onToggleSidebar(() => {
        setSidebarVisible(prev => !prev);
      });

      // Cleanup on unmount
      return () => {
        window.electronAPI.removeToggleSidebarListener();
      };
    }
  }, []);

  useEffect(() => {
    // Handle hotkey toggle (Ctrl+Shift+M) for both web and Electron
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'M') {
        event.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div className="min-h-screen">
      {/* Desktop app indicator */}
      {isElectron && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Desktop App
        </div>
      )}

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarVisible ? 'pr-96' : 'pr-0'}`}>
        <div className="app-left-side">
          <div className="content-container">
            <h1 className="main-title">
              Observer
            </h1>
            <p className="subtitle">
              Observer is an AI-powered math assistant that helps you study by reading your notes and providing contextual explanations, quizzes, and summaries.
            </p>
            
            <div className="content-card">
              <h2 className="section-title">How to Use</h2>
              <ol className="instruction-list">
                <li className="instruction-item">
                  <span className="instruction-number">1</span>
                  <span>Press <kbd>Ctrl+Shift+M</kbd> to toggle the sidebar{isElectron && ' (or use the menu)'}</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-number">2</span>
                  <span>Enter your OpenAI API key in the settings</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-number">3</span>
                  <span>Choose your mode: Explain, Quiz, or Summarize</span>
                </li>
                <li className="instruction-item">
                  <span className="instruction-number">4</span>
                  <span>Click "Start Capture" to begin screen analysis</span>
                </li>
                {isElectron && (
                  <li className="instruction-item">
                    <span className="instruction-number">5</span>
                    <span>Use <kbd>Ctrl+T</kbd> to toggle "Always on Top" mode</span>
                  </li>
                )}
              </ol>
            </div>

            <div className="content-card">
              <h3 className="section-title">
                {isElectron ? 'Desktop App Features' : 'Features'}
              </h3>
              <div className="features-grid">
                <div className="feature-item">
                  <h4 className="feature-title">Explain Mode</h4>
                  <p className="feature-description">Get step-by-step explanations of math problems</p>
                </div>
                <div className="feature-item">
                  <h4 className="feature-title">Quiz Mode</h4>
                  <p className="feature-description">Generate practice questions based on your notes</p>
                </div>
                <div className="feature-item">
                  <h4 className="feature-title">Summarize Mode</h4>
                  <p className="feature-description">Get concise summaries of complex topics</p>
                </div>
                {isElectron && (
                  <>
                    <div className="feature-item">
                      <h4 className="feature-title">Always on Top</h4>
                      <p className="feature-description">Overlay over any application</p>
                    </div>
                    <div className="feature-item">
                      <h4 className="feature-title">Global Shortcuts</h4>
                      <p className="feature-description">Works system-wide, not just in browser</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {!sidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="left-side-button"
              >
                Open Sidebar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar isVisible={sidebarVisible} onToggleVisibility={toggleSidebar} />

      {/* Overlay for mobile */}
      {sidebarVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}

export default App;
