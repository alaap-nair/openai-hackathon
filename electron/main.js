const { app, BrowserWindow, globalShortcut, Menu, screen, shell, ipcMain, desktopCapturer } = require('electron');
const path = require('path');

// Determine if in development mode
const isDev = !app.isPackaged;

let mainWindow;
let isAlwaysOnTop = true;

function createWindow() {
  console.log('Creating Electron window...');
  
  // Get the primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Temporarily disable for development
      allowRunningInsecureContent: isDev,
      experimentalFeatures: true
    },
    // Desktop app features
    alwaysOnTop: isAlwaysOnTop,
    skipTaskbar: false,
    resizable: true,
    frame: true,
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Set window title
  mainWindow.setTitle('Math Study Copilot');

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5175'
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  console.log(`Loading URL: ${startUrl}`);
  console.log(`Development mode: ${isDev}`);

  // Load the URL and handle errors
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    
    // Focus the window
    mainWindow.focus();
    
    // Bring to front on macOS
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Handle loading events
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Started loading...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Finished loading');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Handle console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Renderer console [${level}]:`, message);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle window minimize - keep it in taskbar
  mainWindow.on('minimize', () => {
    if (process.platform === 'darwin') {
      app.dock.hide();
    }
  });

  // Handle window restore
  mainWindow.on('restore', () => {
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'Math Study Copilot',
      submenu: [
        {
          label: 'Toggle Always on Top',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            isAlwaysOnTop = !isAlwaysOnTop;
            mainWindow.setAlwaysOnTop(isAlwaysOnTop);
            console.log(`Always on top: ${isAlwaysOnTop}`);
          }
        },
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+Shift+M',
          click: () => {
            // Send message to renderer process to toggle sidebar
            mainWindow.webContents.send('toggle-sidebar');
          }
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.minimize();
          }
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow.close();
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-desktop-sources', async (event, options) => {
  try {
    console.log('Getting desktop sources with options:', options);
    const sources = await desktopCapturer.getSources(options);
    console.log('Found desktop sources:', sources.length);
    return sources;
  } catch (error) {
    console.error('Error getting desktop sources:', error);
    throw error;
  }
});

// App event handlers
app.whenReady().then(() => {
  console.log('Electron app ready');
  createWindow();

  // Register global shortcuts
  globalShortcut.register('CmdOrCtrl+Shift+M', () => {
    console.log('Global shortcut triggered');
    if (mainWindow) {
      mainWindow.webContents.send('toggle-sidebar');
    }
  });

  // Handle app activation (macOS)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app before quit
app.on('before-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // In development, ignore certificate errors
    event.preventDefault();
    callback(true);
  } else {
    // In production, use default behavior
    callback(false);
  }
});

// Export for testing
module.exports = { createWindow }; 