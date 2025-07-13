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

// Component for User Insights
const UserInsights = () => (
  <>
    <div className="content-card insights-section">
      <h3 className="section-title">Your Study Insights</h3>
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-number">247</div>
          <div className="insight-label">Problems Solved</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '82%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">94%</div>
          <div className="insight-label">Success Rate</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '94%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">18</div>
          <div className="insight-label">Study Streak</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">3.2h</div>
          <div className="insight-label">Today</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>

    <div className="content-card">
      <h3 className="section-title">This Week's Performance</h3>
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-number">Algebra</div>
          <div className="insight-label">Strong</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '88%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">Calculus</div>
          <div className="insight-label">Improving</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '65%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">Geometry</div>
          <div className="insight-label">Excellent</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '95%' }}></div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-number">Stats</div>
          <div className="insight-label">Needs Focus</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '42%' }}></div>
          </div>
        </div>
      </div>
    </div>
  </>
);

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isElectron, setIsElectron] = useState(false);
  const [howToUseExpanded, setHowToUseExpanded] = useState(false);

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

  const toggleHowToUse = () => {
    setHowToUseExpanded(prev => !prev);
  };

  return (
    <div className="app">
      {/* Sidebar - conditionally rendered based on sidebarVisible */}
      {sidebarVisible && (
        <Sidebar
          isVisible={sidebarVisible}
          onToggleVisibility={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarVisible ? 'pr-96' : 'pr-0'}`}>
        <div className="app-left-side">
          <div className="two-column-layout">
            {/* Left Column - Scrollable Dashboard */}
            <div className="content-column">
              <h1 className="main-title">
                Observer
              </h1>
              <p className="subtitle">
                Observer is an AI-powered math assistant that helps you study by reading your notes and providing contextual explanations, quizzes, and summaries.
              </p>
              
              {/* Collapsible How to Use Section */}
              <div className="content-card">
                <div className="collapsible-header" onClick={toggleHowToUse}>
                  <h2 className="section-title">How to Use</h2>
                  <svg
                    className={`collapsible-arrow ${howToUseExpanded ? 'expanded' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <div className={`collapsible-content ${howToUseExpanded ? 'expanded' : 'collapsed'}`}>
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

              {/* User Insights Section - Only show in left column if sidebar is visible */}
              {sidebarVisible && <UserInsights />}
            </div>

            {/* Right Column - Show welcome cards when sidebar is open, insights when closed */}
            <div className="content-column">
              {sidebarVisible ? (
                // Original welcome content when sidebar is open
                <>
                  <div className="content-card welcome-card">
                    <h2 className="welcome-title">Welcome to Observer 👋</h2>
                    <p className="welcome-subtitle">Ready to dive into your notes?</p>
                  </div>

                  <div className="content-card">
                    <h3 className="section-title">Today I'm working on:</h3>
                    <select className="subject-dropdown">
                      <option value="">Select a subject...</option>
                      <option value="algebra">Algebra</option>
                      <option value="geometry">Geometry</option>
                      <option value="calculus">Calculus</option>
                    </select>
                  </div>

                  <div className="content-card">
                    <h3 className="section-title">Quick Actions</h3>
                    <div className="quick-actions">
                      <button className="action-button">Re-analyze Current Screen</button>
                      <button className="action-button">Start a New Math Session</button>
                    </div>
                  </div>

                  <div className="content-card">
                    <h3 className="section-title">Today's Study Goal</h3>
                    <p className="goal-text">Review 3 Linear equations problems + try 1 quiz</p>
                    <button className="action-button mark-done">Mark as Done</button>
                  </div>
                </>
              ) : (
                // Show insights when sidebar is closed
                <UserInsights />
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
  );
}

export default App;
