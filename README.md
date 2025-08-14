# QuickBeam Chrome Extension

A Chrome extension that provides intelligent text selection tools with context-sensitive actions for addresses, phone numbers, emails, tracking numbers, and more.

## 🚀 Current Status: Execution Cycle 3 Complete

**Phase 1 - Foundation & MVP**: 75% Complete  
**Current Phase**: Basic Quick Actions Implementation ✅

### ✅ Completed Features

#### Core Framework (Execution Cycles 1-2)
- [x] Chrome extension manifest with Manifest V3 compliance
- [x] TypeScript + Vite build system
- [x] Content script injection and management
- [x] Text selection detection with debouncing
- [x] Intelligent toolbar positioning system
- [x] Pattern recognition engine for multiple data types
- [x] Action button system with factory pattern
- [x] Comprehensive CSS styling with accessibility support

#### Basic Quick Actions (Execution Cycle 3)
- [x] **Map It**: Google Maps integration for addresses
- [x] **Compose Email**: Email composition for email addresses
- [x] **Call/Message**: Phone actions for phone numbers
- [x] **Copy**: Universal copy functionality
- [x] **Search**: Universal search functionality
- [x] **Track Package**: Package tracking for carrier numbers
- [x] **Convert**: Basic conversion actions for currency/units
- [x] **Translate**: Google Translate integration
- [x] **Define**: Dictionary lookup functionality
- [x] **Preferences Page**: Fully functional options page with storage

### 🔄 In Progress
- [ ] Enhanced pattern recognition accuracy
- [ ] Performance optimization
- [ ] Unit testing implementation

### 📋 Upcoming (Execution Cycle 4)
- [ ] Unit testing for all core functions
- [ ] Integration testing in Chrome
- [ ] Bug fixes and performance optimization
- [ ] Documentation generation
- [ ] Beta testing preparation

## 🛠️ Installation & Development

### Prerequisites
- Node.js 18+ 
- Chrome browser
- Git

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd quickbeam

# Install dependencies
npm install

# Build the extension
npm run build

# For development with watch mode
npm run dev
```

### Loading in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder from the project
5. The extension should now be active

## 🧪 Testing

### Test Page
Open `test-extension.html` in Chrome to test all functionality:

1. **Address Recognition**: Select addresses to test "Map It" action
2. **Email Actions**: Select email addresses to test "Compose Email"
3. **Phone Actions**: Select phone numbers to test "Call/Message"
4. **Tracking Numbers**: Select tracking numbers to test "Track Package"
5. **Universal Actions**: Test "Copy" and "Search" on any text
6. **Preferences**: Test the options page functionality

### Testing Instructions
1. Load the extension in Chrome
2. Open `test-extension.html`
3. Select text to see the toolbar appear
4. Click action buttons to test functionality
5. Right-click extension icon → Options to test preferences

## 🏗️ Architecture

### Core Components
- **ContentScriptManager**: Main orchestrator for content scripts
- **TextSelectionManager**: Handles text selection detection
- **ToolbarManager**: Manages toolbar UI and positioning
- **PatternRecognitionEngine**: Detects patterns in selected text
- **ActionButtonManager**: Manages and executes quick actions

### Pattern Recognition
The extension recognizes:
- **Addresses**: Street addresses with various formats
- **Phone Numbers**: International and local formats
- **Emails**: Standard email address patterns
- **Tracking Numbers**: UPS, FedEx, USPS, DHL formats
- **Dates/Times**: Multiple date and time formats
- **Currency**: Dollar, Euro, Pound, Yen amounts
- **Units**: Weight, distance, volume, temperature

### Action System
Actions are dynamically generated based on:
- Detected patterns in selected text
- User preferences (enabled/disabled actions)
- Context and relevance

## ⚙️ Configuration

### User Preferences
- **Toolbar Settings**: Position, auto-hide, delay
- **Action Toggles**: Enable/disable specific actions
- **Privacy Settings**: Local processing, data collection
- **Appearance**: Theme, compact mode, icons

### Storage
- Chrome Storage Sync API for preferences
- Real-time preference updates across tabs
- Persistent settings between sessions

## 🔒 Security & Privacy

- **Local Processing**: Pattern detection runs locally
- **Minimal Permissions**: Only necessary Chrome APIs
- **No Data Collection**: User data stays local by default
- **HTTPS Only**: All external API calls use secure connections

## 📊 Performance

- **Toolbar Appearance**: <100ms target
- **Pattern Detection**: <50ms target
- **Action Execution**: <200ms target
- **Memory Usage**: <50MB target

## 🚧 Development Roadmap

### Phase 1: Foundation & MVP (Current)
- [x] Core architecture and basic actions
- [ ] Testing and optimization
- [ ] Beta preparation

### Phase 2: Enhanced Features
- [ ] Advanced pattern recognition
- [ ] Additional quick actions
- [ ] User experience improvements

### Phase 3: Production Release
- [ ] Chrome Web Store submission
- [ ] Paid features implementation
- [ ] Monetization integration

### Phase 4: Growth & Optimization
- [ ] Performance optimization
- [ ] Advanced analytics
- [ ] Enterprise features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Features**: Request features via GitHub Discussions
- **Documentation**: Check the docs/ folder for detailed guides

---

**Last Updated**: December 2024  
**Version**: 1.0.0-alpha  
**Status**: Active Development
