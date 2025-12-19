# 🍅 Pomodoro Timer

A beautiful, minimal Pomodoro timer application built with React and TypeScript. Focus on your work with the proven Pomodoro Technique.

## ✨ Features

- **⏱️ Classic Pomodoro Technique**: 25-minute focus sessions with short (5-min) and long (15-min) breaks
- **🔄 Smart Break Management**: Automatic cycle tracking - get a long break after every 4 focus sessions
- **📊 Progress Tracking**: See your daily Pomodoro count and cycle progress at a glance
- **⚙️ Customization**: Adjust timer durations to fit your personal productivity rhythm
- **🔔 Notifications**: Visual banner + optional sound notifications when sessions complete
- **🚀 Auto-Start**: Optional auto-start for breaks and focus sessions to minimize interruptions
- **💾 State Persistence**: Timer state and preferences saved automatically
- **🎨 Beautiful UI**: Warm, calm color scheme with smooth animations and mode-specific colors
- **⌨️ Keyboard Friendly**: Full keyboard navigation support

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pomodoro-timer.git
cd pomodoro-timer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎯 How to Use

1. **Start a Focus Session**: Click "Start Focus" to begin a 25-minute work session
2. **Take a Break**: When the timer completes, you'll see a notification. Click "Start Break" to begin your break
3. **Track Progress**: Watch your daily Pomodoro count increase. After 4 sessions, you'll get a long break!
4. **Customize**: Click the ⚙️ icon to adjust timer durations, enable auto-start, or toggle sounds
5. **Stay Focused**: The timer continues running even if you navigate away from the tab

## 📁 Project Structure

```
pomodoro/
├── src/
│   ├── components/          # React components
│   │   ├── Timer/          # Timer display and controls
│   │   ├── Settings/       # Settings panel and controls
│   │   ├── Notifications/  # Notification banner
│   │   ├── SessionTracking/# Progress indicators
│   │   └── App.tsx         # Root application
│   ├── hooks/              # Custom React hooks
│   │   ├── useTimer.ts     # Timer logic
│   │   ├── useSettings.ts  # Settings management
│   │   ├── useSessionTracking.ts  # Progress tracking
│   │   ├── useNotifications.ts    # Notification handling
│   │   └── useLocalStorage.ts     # Persistence
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles and themes
│   └── constants/          # App constants
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── public/                # Static assets
│   └── sounds/           # Notification sounds
└── specs/                # Design documentation
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run typecheck    # Type-check TypeScript
```

## ⚙️ Configuration

### Timer Durations

Customize timer durations in the settings panel:

- **Focus**: 5-60 minutes (default: 25)
- **Short Break**: 1-15 minutes (default: 5)
- **Long Break**: 10-30 minutes (default: 15)

### Auto-Start

Enable auto-start to minimize interruptions:

- **Auto-start Breaks**: Automatically start break timer when focus completes
- **Auto-start Focus**: Automatically start focus timer when break completes

### Notifications

- **Sound Notifications**: Toggle sound on/off (visual banner always shows)
- **Sound Preview**: Test notification sounds in settings

## 🧪 Testing

The project includes comprehensive tests for critical functionality:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎨 Design Philosophy

This Pomodoro timer is designed to be:

- **Minimal**: Clean, distraction-free interface
- **Friendly**: Warm colors, smooth animations, clear feedback
- **Reliable**: State persistence, accurate timing, no data loss
- **Accessible**: Keyboard navigation, clear labels, responsive design
- **Fast**: <150KB bundle, instant interactions, smooth performance

## 📊 Technical Details

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library
- **State Management**: React Hooks + localStorage
- **Styling**: CSS Modules with CSS variables
- **Bundle Size**: ~50KB gzipped (production)
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the [Pomodoro Technique](https://francescocirillo.com/pages/pomodoro-technique) by Francesco Cirillo
- Built with modern web technologies and best practices

## 📮 Contact

Have questions or suggestions? Open an issue or reach out!

---

**Made with ❤️ and 🍅**

