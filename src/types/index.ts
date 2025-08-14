// Core extension types and interfaces

export interface ExtensionState {
  isEnabled: boolean;
  preferences: UserPreferences;
  lastUsed: number;
  usageStats: UsageStats;
}

export interface UserPreferences {
  toolbar: ToolbarPreferences;
  actions: ActionPreferences;
  privacy: PrivacyPreferences;
  appearance: AppearancePreferences;
}

export interface ToolbarPreferences {
  position: 'above' | 'below' | 'adjacent';
  autoHide: boolean;
  hideDelay: number;
  showOnSelection: boolean;
}

export interface ActionPreferences {
  enabledActions: string[];
  defaultCalendar: 'google' | 'outlook' | 'apple';
  preferredCurrency: string;
  preferredUnits: 'metric' | 'imperial';
  translationTarget: string;
  notePlatform: 'notion' | 'evernote' | 'onenote' | 'google-keep' | 'todoist' | 'trello' | 'asana' | 'google-docs' | 'dropbox-paper';
  sharePlatform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'reddit' | 'pinterest' | 'tumblr' | 'email';
}

export interface PrivacyPreferences {
  localProcessingOnly: boolean;
  dataCollection: boolean;
  analytics: boolean;
  cloudProcessing: boolean;
}

export interface AppearancePreferences {
  theme: 'light' | 'dark' | 'auto' | 'high-contrast';
  compactMode: boolean;
  showIcons: boolean;
  customColors: boolean;
  largeText: boolean;
}

export interface UsageStats {
  totalActions: number;
  actionsByType: Record<string, number>;
  lastActionDate: number;
  dailyUsage: Record<string, number>;
}

export interface PatternMatch {
  type: PatternType;
  match: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  metadata?: Record<string, any>;
}

export enum PatternType {
  ADDRESS = 'address',
  PHONE = 'phone',
  EMAIL = 'email',
  DATE_TIME = 'date_time',
  TRACKING_NUMBER = 'tracking_number',
  CURRENCY = 'currency',
  UNIT = 'unit',
  URL = 'url'
}

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ActionType;
  enabled: boolean;
  execute: (text: string, context?: any) => Promise<void>;
}

export enum ActionType {
  MAP_IT = 'map_it',
  EMAIL = 'email',
  CALENDAR = 'calendar',
  TRACK_PACKAGE = 'track_package',
  CALL = 'call',
  MESSAGE = 'message',
  COPY = 'copy',
  SEARCH = 'search',
  CONVERT = 'convert',
  TRANSLATE = 'translate',
  DEFINE = 'define',
  QUICK_NOTE = 'quick_note',
  SHARE = 'share'
}

export interface ActionContext {
  selectedText: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: number;
  userPreferences: UserPreferences;
}

export interface BuildResult {
  success: boolean;
  artifacts?: string[];
  duration: number;
  environment: string;
  error?: string;
}

export interface TestResults {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  coverage: number;
}

export interface SecurityReport {
  secure: boolean;
  vulnerabilities: SecurityCheck[];
  riskScore: number;
  recommendations: string[];
}

export interface SecurityCheck {
  name: string;
  passed: boolean;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface UpdateInfo {
  version: string;
  changelog: string;
  downloadUrl: string;
  mandatory: boolean;
}
