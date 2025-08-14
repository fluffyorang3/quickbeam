// Background service worker entry point
import { EXTENSION_CONFIG } from '../constants';

console.log(`${EXTENSION_CONFIG.NAME} v${EXTENSION_CONFIG.VERSION} background script loaded`);

// Initialize background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('Message received:', message);
  // Handle messages from content scripts and popup
  sendResponse({ success: true });
});
