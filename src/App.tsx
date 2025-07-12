import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import './App.css';

// Electron API type declaration
declare global {
  interface Window {
    electronAPI?: {
      onToggleSidebar: (callback: () => void) => void;
      removeToggleSidebarListener: () => void;
      platform: string;
      isElectron: boolean;
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
    <div className="min-h-screen bg-gray-100">
      {/* Desktop app indicator */}
      {isElectron && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Desktop App
        </div>
      )}

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarVisible ? 'pr-96' : 'pr-0'}`}>
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Math Study Copilot
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              AI-powered math assistant that helps you study by reading your notes and providing contextual explanations, quizzes, and summaries.
            </p>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
              <ol className="text-left text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">1</span>
                  Press <kbd className="bg-gray-200 px-2 py-1 rounded text-sm">Ctrl+Shift+M</kbd> to toggle the sidebar{isElectron && ' (or use the menu)'}
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">2</span>
                  Enter your OpenAI API key in the settings
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">3</span>
                  Choose your mode: Explain, Quiz, or Summarize
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">4</span>
                  Click "Start Capture" to begin screen analysis
                </li>
                {isElectron && (
                  <li className="flex items-start">
                    <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-3 mt-0.5">5</span>
                    Use <kbd className="bg-gray-200 px-2 py-1 rounded text-sm">Ctrl+T</kbd> to toggle "Always on Top" mode
                  </li>
                )}
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {isElectron ? 'Desktop App Features' : 'Features'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong className="text-blue-700">Explain Mode</strong>
                  <p className="text-blue-600">Get step-by-step explanations of math problems</p>
                </div>
                <div>
                  <strong className="text-blue-700">Quiz Mode</strong>
                  <p className="text-blue-600">Generate practice questions based on your notes</p>
                </div>
                <div>
                  <strong className="text-blue-700">Summarize Mode</strong>
                  <p className="text-blue-600">Get concise summaries of complex topics</p>
                </div>
              </div>
              {isElectron && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-green-700">Always on Top</strong>
                      <p className="text-green-600">Overlay over any application</p>
                    </div>
                    <div>
                      <strong className="text-green-700">Global Shortcuts</strong>
                      <p className="text-green-600">Works system-wide, not just in browser</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {!sidebarVisible && (
              <button
                onClick={toggleSidebar}
                className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
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
