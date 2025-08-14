// Application constants and configuration

export const EXTENSION_CONFIG = {
  NAME: 'Universal Quick Actions',
  VERSION: '1.0.0',
  DESCRIPTION: 'Intelligent text selection tool that recognizes patterns and provides context-sensitive actions',
  AUTHOR: 'Universal Quick Actions Team',
  HOMEPAGE_URL: 'https://github.com/universal-quick-actions',
  SUPPORT_EMAIL: 'support@universal-quick-actions.com'
} as const;

export const PERFORMANCE_THRESHOLDS = {
  TOOLBAR_APPEARANCE: 100, // ms
  PATTERN_DETECTION: 50,   // ms
  ACTION_EXECUTION: 200,   // ms
  MAX_MEMORY_USAGE: 50,    // MB
  MAX_LOAD_TIME: 2000      // ms
} as const;

export const PATTERN_REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  TRACKING: {
    UPS: /^1Z[0-9A-Z]{16}$/,
    FEDEX: /^[0-9]{12}$|^[0-9]{15}$/,
    USPS: /^[0-9]{20}$|^[0-9]{22}$/,
    DHL: /^[0-9]{10}$|^[0-9]{12}$/
  }
} as const;

export const STORAGE_KEYS = {
  EXTENSION_STATE: 'extensionState',
  USER_PREFERENCES: 'userPreferences',
  USAGE_STATS: 'usageStats',
  ERROR_LOGS: 'errorLogs',
  FEATURE_FLAGS: 'featureFlags'
} as const;

export const DEFAULT_PREFERENCES: import('../types').UserPreferences = {
  toolbar: {
    position: 'adjacent',
    autoHide: true,
    hideDelay: 3000,
    showOnSelection: true
  },
  actions: {
    enabledActions: ['copy', 'search', 'map_it', 'email', 'call'],
    defaultCalendar: 'google',
    preferredCurrency: 'USD',
    preferredUnits: 'metric',
    translationTarget: 'en'
  },
  privacy: {
    localProcessingOnly: true,
    dataCollection: false,
    analytics: false,
    cloudProcessing: false
  },
  appearance: {
    theme: 'auto',
    compactMode: false,
    showIcons: true,
    customColors: false
  }
} as const;

export const ERROR_MESSAGES = {
  PATTERN_DETECTION_FAILED: 'Failed to detect patterns in selected text',
  ACTION_EXECUTION_FAILED: 'Failed to execute action',
  STORAGE_ACCESS_DENIED: 'Storage access denied',
  NETWORK_ERROR: 'Network error occurred',
  PERMISSION_DENIED: 'Permission denied',
  UNKNOWN_ERROR: 'An unknown error occurred'
} as const;

export const SUCCESS_MESSAGES = {
  ACTION_COMPLETED: 'Action completed successfully',
  PREFERENCES_SAVED: 'Preferences saved successfully',
  UPDATE_AVAILABLE: 'Update available',
  FEATURE_ENABLED: 'Feature enabled successfully'
} as const;

export const API_ENDPOINTS = {
  TRANSLATION: 'https://api.translate.com/v1/translate',
  DICTIONARY: 'https://api.dictionary.com/v1/entries',
  CURRENCY: 'https://api.exchangerate-api.com/v4/latest',
  CALENDAR: 'https://calendar.google.com/calendar/render'
} as const;

export const FEATURE_FLAGS = {
  AI_PARSING: false,
  CLOUD_SYNC: false,
  CUSTOM_ACTIONS: false,
  ADVANCED_ANALYTICS: false
} as const;
