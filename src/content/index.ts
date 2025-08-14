// Content script entry point
import { EXTENSION_CONFIG } from '../constants';

console.log(`${EXTENSION_CONFIG.NAME} v${EXTENSION_CONFIG.VERSION} content script loaded`);

// Initialize content script
document.addEventListener('DOMContentLoaded', () => {
  console.log('Content script initialized');
  // TODO: Implement text selection detection and toolbar
});
