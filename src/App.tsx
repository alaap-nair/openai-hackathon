import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { LeftDashboard } from './components/LeftDashboard';
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
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [dashboardVisible] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // For showing help/info

  useEffect(() => {
    // Check if running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
      
      // Listen for Electron's global shortcut
      const electronAPI = window.electronAPI as any;
      if (electronAPI.onToggleSidebar) {
        electronAPI.onToggleSidebar(() => {
          setSidebarVisible(prev => !prev);
        });
      }

      // Cleanup on unmount
      return () => {
        if (electronAPI.removeToggleSidebarListener) {
          electronAPI.removeToggleSidebarListener();
        }
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

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  if (!sidebarVisible) {
    // Minimal floating button when sidebar is hidden
    return (
      <div className="app-container">
        <LeftDashboard isVisible={dashboardVisible} sidebarVisible={sidebarVisible} />
        <div className="floating-controls">
          <button
            onClick={toggleSidebar}
            className="floating-button main-button"
            title="Open Math Assistant"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
            </svg>
          </button>
          {isElectron && (
            <div className="floating-indicator">
              Desktop
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <LeftDashboard isVisible={dashboardVisible} sidebarVisible={sidebarVisible} />
      
      <div className="overlay-app">
        {/* Desktop app indicator */}
        {isElectron && (
          <div className="desktop-indicator">
            Desktop App
          </div>
        )}

        {/* Main overlay content */}
        <div className="overlay-content">
          {/* Compact header */}
          <div className="overlay-header">
            <div className="header-info">
              <h1 className="overlay-title">Math Assistant</h1>
              <p className="overlay-subtitle">AI-powered analysis</p>
            </div>
            <div className="header-actions">
              <button
                onClick={toggleExpanded}
                className="action-button"
                title={isExpanded ? 'Hide help' : 'Show help'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </button>
              <button
                onClick={toggleSidebar}
                className="action-button close-button"
                title="Hide assistant"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Help section - only shown when expanded */}
          {isExpanded && (
            <div className="help-section">
              <div className="help-card">
                <h3>Quick Start</h3>
                <ul>
                  <li>Position your notes/problems on the left side</li>
                  <li>Enter your OpenAI API key below</li>
                  <li>Choose a mode and capture!</li>
                </ul>
              </div>
              <div className="help-card">
                <h3>Modes</h3>
                <div className="modes-quick">
                  <span className="mode-tag">🎯 Explain</span>
                  <span className="mode-tag">❓ Quiz</span>
                  <span className="mode-tag">📝 Summarize</span>
                </div>
              </div>
              {isElectron && (
                <div className="help-card">
                  <h3>Shortcuts</h3>
                  <div className="shortcuts-quick">
                    <span><kbd>Ctrl+Shift+M</kbd> Toggle</span>
                    <span><kbd>Ctrl+T</kbd> Always on top</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main sidebar content */}
          <div className="sidebar-container">
            <Sidebar isVisible={true} onToggleVisibility={toggleSidebar} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
