# Universal Quick Actions Chrome Extension

Intelligent text selection tool that recognizes patterns and provides context-sensitive actions.

## Features

- **Smart Pattern Recognition**: Automatically detects addresses, phone numbers, emails, dates, tracking numbers, and more
- **Context-Sensitive Actions**: Provides relevant actions based on detected patterns
- **Privacy-First**: Local processing by default, optional cloud features with consent
- **Customizable**: Extensive preferences and customization options
- **Fast & Lightweight**: Optimized for performance with <100ms response time

## Quick Actions

- 🗺️ **Map It**: Open addresses in Google Maps
- 📧 **Email**: Compose emails with pre-filled addresses
- 📞 **Call/Message**: Quick access to communication apps
- 📦 **Track Package**: Track shipping with major carriers
- 📅 **Calendar**: Create calendar events from text
- 🔍 **Search**: Quick web searches
- 💱 **Convert**: Currency and unit conversion
- 🌐 **Translate**: Multi-language translation
- 📚 **Define**: Dictionary lookups

## Development

### Prerequisites

- Node.js 20.17+ 
- npm 10+

### Setup

1. Clone the repository
```bash
git clone https://github.com/universal-quick-actions/extension.git
cd extension
```

2. Install dependencies
```bash
npm install
```

3. Build the extension
```bash
npm run build
```

4. Load in Chrome
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Commands

```bash
# Development build with watch mode
npm run build:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test
```

## Project Structure

```
src/
├── background/          # Service worker
├── content/             # Content scripts
├── popup/               # Extension popup
├── options/             # Options page
├── components/          # Reusable UI components
├── utils/               # Utility functions
├── types/               # TypeScript interfaces
└── constants/           # Application constants
```

## Architecture

- **Manifest V3**: Latest Chrome extension standards
- **TypeScript**: Type-safe development
- **Vite**: Fast build tooling
- **ESLint + Prettier**: Code quality and formatting
- **Husky**: Git hooks for quality assurance

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@universal-quick-actions.com
- 🐛 Issues: [GitHub Issues](https://github.com/universal-quick-actions/extension/issues)
- 📖 Documentation: [Wiki](https://github.com/universal-quick-actions/extension/wiki)

## Roadmap

- [ ] MVP Release (Month 1)
- [ ] Beta Testing (Month 2-3)
- [ ] Production Launch (Month 4)
- [ ] Advanced Features (Month 5+)
- [ ] Mobile Companion App
- [ ] Enterprise Features

## Performance Targets

- Toolbar appearance: <100ms
- Pattern detection: <50ms
- Memory usage: <50MB
- Load time: <2s
- Test coverage: >90%
