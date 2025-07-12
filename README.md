# Math Study Copilot - Desktop App

An AI-powered math assistant that helps you study by reading your notes and providing contextual explanations, quizzes, and summaries. Now available as a desktop application that can overlay over any application!

## 🚀 Features

### Core Features
- **Real-time OCR**: Extract text from any screen using Tesseract.js
- **AI-Powered Analysis**: Uses OpenAI GPT-4 for intelligent responses
- **Three Modes**: 
  - **Explain**: Get step-by-step explanations of math problems
  - **Quiz**: Generate practice questions based on your notes
  - **Summarize**: Get concise summaries of complex topics

### Desktop App Features ✨
- **Always On Top**: Overlay over any application (Google Docs, Word, etc.)
- **Global Shortcuts**: Works system-wide, not just in browser
- **Native Menu**: Full desktop integration with native menus
- **Screen Capture**: Advanced screen capture with continuous monitoring
- **Persistent Settings**: API keys and preferences saved locally

## 🎯 How to Use

### Quick Start
1. **Launch the app**: The desktop app will appear with a "Desktop App" indicator
2. **Set your API key**: Enter your OpenAI API key in the sidebar settings
3. **Toggle sidebar**: Press `Ctrl+Shift+M` or click "Open Sidebar"
4. **Select mode**: Choose Explain, Quiz, or Summarize
5. **Start capture**: Click "Start Capture" and grant screen share permissions
6. **Stay on top**: Use `Ctrl+T` to toggle "Always on Top" mode

### Global Shortcuts
- `Ctrl+Shift+M` - Toggle sidebar
- `Ctrl+T` - Toggle "Always on Top" mode
- `Ctrl+M` - Minimize window
- `Ctrl+W` - Close window
- `Ctrl+Q` - Quit application (Linux/Windows)
- `Cmd+Q` - Quit application (macOS)

### Menu Options
Access all features through the native menu:
- **Math Study Copilot** → Toggle Always on Top, Toggle Sidebar, Minimize, Close, Quit
- **Edit** → Standard editing commands (Undo, Redo, Cut, Copy, Paste, Select All)
- **View** → Reload, DevTools, Zoom controls, Fullscreen
- **Window** → Minimize, Close

## 💻 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd openai-hackathon

# Install dependencies
npm install

# Run in development mode (web)
npm run dev

# Run as desktop app in development
npm run electron-dev
```

### Build Commands
```bash
# Build for web
npm run build

# Build desktop app
npm run electron-pack

# Create distributable
npm run dist
```

### Project Structure
```
openai-hackathon/
├── electron/
│   ├── main.js          # Main Electron process
│   └── preload.js       # Preload script for security
├── src/
│   ├── components/
│   │   └── Sidebar.tsx  # Main sidebar component
│   ├── lib/
│   │   └── api.ts       # OpenAI API integration
│   ├── utils/
│   │   └── capture.ts   # Screen capture & OCR
│   ├── App.tsx          # Main React component
│   └── main.tsx         # React entry point
├── public/              # Static assets
├── dist/                # Built web app
└── dist-electron/       # Built desktop app
```

## 🔧 Configuration

### OpenAI API Key
1. Get your API key from [OpenAI](https://platform.openai.com/api-keys)
2. Open the sidebar (`Ctrl+Shift+M`)
3. Enter your API key in the settings section
4. The key is saved locally and persists between sessions

### Screen Capture
- The app uses `getDisplayMedia` API for screen capture
- Grant permissions when prompted
- Captures occur every 3 seconds while active
- OCR extracts text from captured images

## 📱 Platform Support

### Desktop Platforms
- **Windows**: `.exe` installer and portable version
- **macOS**: `.dmg` installer for Intel and Apple Silicon
- **Linux**: `.AppImage` for universal compatibility

### Browser Support (Web Version)
- Chrome 88+
- Firefox 90+
- Safari 14+
- Edge 88+

## 🛠️ Technical Details

### Technologies Used
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop**: Electron 26+
- **AI**: OpenAI GPT-4 API
- **OCR**: Tesseract.js
- **Build**: Vite, Electron Builder
- **Testing**: Jest, React Testing Library

### Security
- Context isolation enabled
- Node integration disabled
- Preload script for secure API exposure
- Content Security Policy enforced

## 🚨 Troubleshooting

### Common Issues
1. **Screen capture not working**: Ensure you grant screen share permissions
2. **API key not working**: Verify your OpenAI API key is correct
3. **App not staying on top**: Use `Ctrl+T` to toggle "Always on Top" mode
4. **Sidebar not opening**: Try `Ctrl+Shift+M` or use the menu

### Debug Mode
Run with environment variable for debug logs:
```bash
NODE_ENV=development npm run electron-dev
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔄 Version History

- **v1.0.0**: Initial desktop app release
  - Electron integration
  - Always on Top functionality
  - Global shortcuts
  - Real OCR implementation
  - Direct OpenAI API integration

---

**Need help?** Open an issue or contact the development team.
