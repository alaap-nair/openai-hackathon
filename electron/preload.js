const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Sidebar toggle functionality
  onToggleSidebar: (callback) => ipcRenderer.on('toggle-sidebar', callback),
  removeToggleSidebarListener: () => ipcRenderer.removeAllListeners('toggle-sidebar'),
  
  // Screen capture functionality
  getDesktopSources: async (options) => {
    try {
      // Use IPC to get desktop sources from main process
      const sources = await ipcRenderer.invoke('get-desktop-sources', options);
      return sources;
    } catch (error) {
      console.error('Failed to get desktop sources:', error);
      return [];
    }
  },
  
  // Platform information
  platform: process.platform,
  
  // App information
  isElectron: true,
  
  // Version information
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Security: Remove Node.js globals from renderer process
delete window.require;
delete window.exports;
delete window.module; 