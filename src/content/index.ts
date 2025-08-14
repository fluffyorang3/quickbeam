// Content script entry point
import { EXTENSION_CONFIG, STORAGE_KEYS, DEFAULT_PREFERENCES } from '../constants';
import { TextSelectionManager } from './text-selection-manager';
import { ToolbarManager } from './toolbar-manager';
import { PatternRecognitionEngine } from './pattern-recognition-engine';
import { ActionButtonManager } from './action-button-manager';
import { ContextMenuManager } from './context-menu-manager';
import { KeyboardNavigationManager } from './keyboard-navigation-manager';
import { AccessibilityManager } from './accessibility-manager';
import { QuickAction, UserPreferences } from '../types';
import './toolbar.css';

console.log(`${EXTENSION_CONFIG.NAME} v${EXTENSION_CONFIG.VERSION} content script loaded`);

class ContentScriptManager {
  private textSelectionManager: TextSelectionManager;
  private toolbarManager: ToolbarManager;
  private patternRecognitionEngine: PatternRecognitionEngine;
  private actionButtonManager: ActionButtonManager;
  private contextMenuManager: ContextMenuManager;
  private keyboardNavigationManager: KeyboardNavigationManager;
  private accessibilityManager: AccessibilityManager;
  private currentPreferences: UserPreferences = DEFAULT_PREFERENCES;
  private isInitialized = false;

  constructor() {
    this.textSelectionManager = new TextSelectionManager();
    this.toolbarManager = new ToolbarManager();
    this.patternRecognitionEngine = new PatternRecognitionEngine();
    this.actionButtonManager = new ActionButtonManager();
    this.contextMenuManager = new ContextMenuManager(
      this.patternRecognitionEngine,
      this.actionButtonManager
    );
    this.keyboardNavigationManager = new KeyboardNavigationManager();
    this.accessibilityManager = new AccessibilityManager(this.currentPreferences);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load user preferences
      await this.loadPreferences();
      
      // Initialize all managers
      await this.textSelectionManager.initialize();
      await this.toolbarManager.initialize();
      await this.patternRecognitionEngine.initialize();
      await this.actionButtonManager.initialize();
      await this.contextMenuManager.initialize();
      await this.accessibilityManager.initialize();
      
      // Initialize keyboard navigation
      this.keyboardNavigationManager.initialize();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set up message listener for preference updates
      this.setupMessageListener();
      
      // Apply accessibility settings
      this.applyAccessibilitySettings();
      
      // Make toolbar accessible
      this.toolbarManager.makeAccessible();

      this.isInitialized = true;
      console.log('Content script fully initialized with enhanced UX features');
    } catch (error) {
      console.error('Failed to initialize content script:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(STORAGE_KEYS.USER_PREFERENCES);
      if (result[STORAGE_KEYS.USER_PREFERENCES]) {
        this.currentPreferences = {
          ...DEFAULT_PREFERENCES,
          ...result[STORAGE_KEYS.USER_PREFERENCES]
        };
      }
      
      // Apply preferences to managers
      this.applyPreferences();
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Use default preferences if storage fails
    }
  }

  private applyPreferences(): void {
    // Apply toolbar preferences
    this.toolbarManager.updatePreferences(this.currentPreferences.toolbar);
    
    // Apply action preferences
    this.actionButtonManager.updateActionAvailabilityFromPreferences(this.currentPreferences.actions);
    
    // Apply appearance preferences
    this.applyAppearancePreferences();
    
    // Apply accessibility preferences
    this.applyAccessibilityPreferences();
  }

  private applyAppearancePreferences(): void {
    const appearance = this.currentPreferences.appearance;
    
    // Apply theme
    this.toolbarManager.setTheme(appearance.theme);
    
    // Apply compact mode
    this.toolbarManager.setCompactMode(appearance.compactMode);
    
    // Apply icon visibility
    this.toolbarManager.setShowIcons(appearance.showIcons);
    
    // Apply custom colors if enabled
    if (appearance.customColors) {
      // This would be set from user preferences
      this.toolbarManager.setCustomColors('#1a73e8', '#ffffff', '#333333');
    }
  }

  private applyAccessibilityPreferences(): void {
    const appearance = this.currentPreferences.appearance;
    
    // Apply high contrast if enabled
    if (appearance.theme === 'high-contrast') {
      this.accessibilityManager.enableHighContrast();
    }
    
    // Apply large text if enabled
    if (appearance.largeText) {
      this.accessibilityManager.enableLargeText();
    }
  }

  private setupEventListeners(): void {
    // Listen for text selection changes
    this.textSelectionManager.onSelectionChange((selection) => {
      this.handleTextSelection(selection);
    });

    // Listen for toolbar actions
    this.toolbarManager.onActionExecute((action: QuickAction) => {
      this.handleToolbarAction(action);
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.toolbarManager.hide();
        this.contextMenuManager.hide();
      }
    });

    // Listen for page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleKeyboardShortcuts(event);
    });
  }

  private handleKeyboardShortcuts(event: KeyboardEvent): void {
    // Handle global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          // Ctrl/Cmd + K: Quick search
          this.triggerQuickSearch();
          event.preventDefault();
          break;
        case 'm':
          // Ctrl/Cmd + M: Toggle toolbar
          this.toggleToolbar();
          event.preventDefault();
          break;
        case 's':
          // Ctrl/Cmd + S: Open settings
          this.openSettings();
          event.preventDefault();
          break;
      }
    }
  }

  private triggerQuickSearch(): void {
    // Trigger quick search functionality
    const selection = window.getSelection()?.toString().trim();
    if (selection) {
      this.handleToolbarAction({
        id: 'search',
        name: 'Search',
        description: `Search for "${selection}"`,
        icon: '🔍',
        type: 'search' as any,
        enabled: true,
        execute: async (text: string) => {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(text)}`, '_blank');
        }
      });
    }
  }

  private toggleToolbar(): void {
    if (this.toolbarManager.isToolbarVisible()) {
      this.toolbarManager.hide();
    } else {
      // Show toolbar with current selection if available
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        this.handleTextSelection(selection);
      }
    }
  }

  private openSettings(): void {
    chrome.runtime.openOptionsPage();
  }

  private setupMessageListener(): void {
    // Listen for messages from popup or background script
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'PREFERENCES_UPDATED') {
        this.handlePreferencesUpdate(message.preferences);
        sendResponse({ success: true });
      } else if (message.type === 'TOGGLE_TOOLBAR') {
        this.toggleToolbar();
        sendResponse({ success: true });
      } else if (message.type === 'GET_STATUS') {
        sendResponse({
          isInitialized: this.isInitialized,
          isToolbarVisible: this.toolbarManager.isToolbarVisible(),
          currentSelection: this.toolbarManager.getCurrentSelection()
        });
      }
    });
  }

  private async handlePreferencesUpdate(preferences: UserPreferences): Promise<void> {
    this.currentPreferences = preferences;
    this.applyPreferences();
    
    // Update context menu options
    this.contextMenuManager.updateOptions({
      enabled: preferences.toolbar.showOnSelection,
      showOnRightClick: true,
      includeDefaultActions: true
    });
    
    // Update keyboard navigation options
    this.keyboardNavigationManager.updateOptions({
      enabled: true,
      enableArrowKeys: true,
      enableTabNavigation: true,
      enableShortcuts: true,
      focusIndicator: true
    });
  }

  private async handleTextSelection(selection: string): Promise<void> {
    if (!selection || selection.length === 0) {
      this.toolbarManager.hide();
      return;
    }

    try {
      // Detect patterns in selected text
      const patterns = await this.patternRecognitionEngine.detectPatterns(selection);
      
      // Get available actions based on patterns
      const actions = this.actionButtonManager.getAvailableActions(patterns);
      
      if (actions.length > 0) {
        // Show toolbar with actions
        this.toolbarManager.show(actions, selection);
        
        // Set focusable elements for keyboard navigation
        this.setupKeyboardNavigation(actions);
        
        // Announce to screen reader
        this.accessibilityManager.announceToScreenReader(
          `${actions.length} quick actions available for selected text`
        );
      } else {
        this.toolbarManager.hide();
      }
    } catch (error) {
      console.error('Error handling text selection:', error);
      this.toolbarManager.hide();
    }
  }

  private setupKeyboardNavigation(_actions: QuickAction[]): void {
    // Get toolbar buttons for keyboard navigation
    const toolbar = document.getElementById('quick-actions-toolbar');
    if (toolbar) {
      const buttons = Array.from(toolbar.querySelectorAll('button')) as HTMLElement[];
      this.keyboardNavigationManager.setFocusableElements(buttons);
      
      // Make buttons accessible
      buttons.forEach(button => {
        this.accessibilityManager.ensureKeyboardAccessibility(button);
      });
    }
  }

  private async handleToolbarAction(action: QuickAction): Promise<void> {
    try {
      const startTime = performance.now();
      
      // Execute the action
      await action.execute(this.toolbarManager.getCurrentSelection());
      
      // Hide toolbar
      this.toolbarManager.hide();
      
      // Announce success to screen reader
      this.accessibilityManager.announceToScreenReader(
        `${action.name} action completed successfully`
      );
      
      // Log performance
      const duration = performance.now() - startTime;
      console.log(`Action ${action.name} executed in ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      console.error(`Error executing action ${action.name}:`, error);
      
      // Announce error to screen reader
      this.accessibilityManager.announceToScreenReader(
        `Error executing ${action.name} action`,
        'assertive'
      );
    }
  }

  private applyAccessibilitySettings(): void {
    // Apply current accessibility settings
    this.accessibilityManager.updateOptions({
      enabled: true,
      highContrast: this.currentPreferences.appearance.theme === 'high-contrast',
      largeText: this.currentPreferences.appearance.largeText || false,
      reducedMotion: false,
      screenReader: false,
      focusVisible: true
    });
  }

  // Public methods for external access

  getStatus(): { isInitialized: boolean; isToolbarVisible: boolean; currentSelection: string } {
    return {
      isInitialized: this.isInitialized,
      isToolbarVisible: this.toolbarManager.isToolbarVisible(),
      currentSelection: this.toolbarManager.getCurrentSelection()
    };
  }

  toggleToolbarVisibility(): void {
    this.toggleToolbar();
  }

  // Cleanup method
  cleanup(): void {
    try {
      this.textSelectionManager.cleanup();
      this.toolbarManager.cleanup();
      this.contextMenuManager.cleanup();
      this.keyboardNavigationManager.cleanup();
      this.accessibilityManager.cleanup();
      
      this.isInitialized = false;
      console.log('Content script cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Initialize content script
const contentScriptManager = new ContentScriptManager();
contentScriptManager.initialize().catch(console.error);

// Export for testing purposes
export { ContentScriptManager };
