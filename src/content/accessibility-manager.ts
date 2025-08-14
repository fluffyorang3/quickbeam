import { UserPreferences } from '../types';

export interface AccessibilityOptions {
  enabled: boolean;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  focusVisible: boolean;
}

export class AccessibilityManager {
  private isInitialized = false;
  private options: AccessibilityOptions;
  private currentPreferences: UserPreferences;
  private highContrastStyles: CSSStyleSheet | null = null;
  private largeTextStyles: CSSStyleSheet | null = null;

  constructor(preferences: UserPreferences) {
    this.currentPreferences = preferences;
    this.options = {
      enabled: true,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      focusVisible: true
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set up accessibility features
      this.setupAccessibilityFeatures();
      
      // Apply initial accessibility settings
      this.applyAccessibilitySettings();
      
      // Set up preference change listener
      this.setupPreferenceChangeListener();
      
      this.isInitialized = true;
      console.log('AccessibilityManager initialized');
    } catch (error) {
      console.error('Failed to initialize AccessibilityManager:', error);
      throw error;
    }
  }

  private setupAccessibilityFeatures(): void {
    // Create high contrast stylesheet
    this.createHighContrastStyles();
    
    // Create large text stylesheet
    this.createLargeTextStyles();
    
    // Set up reduced motion detection
    this.setupReducedMotionDetection();
    
    // Set up screen reader detection
    this.setupScreenReaderDetection();
  }

  private createHighContrastStyles(): void {
    this.highContrastStyles = new CSSStyleSheet();
    
    // High contrast color scheme
    const highContrastRules = `
      .quick-actions-toolbar,
      .quick-actions-context-menu,
      .quick-actions-popup {
        background-color: #000000 !important;
        color: #ffffff !important;
        border: 2px solid #ffffff !important;
      }
      
      .quick-actions-toolbar button,
      .quick-actions-context-menu .context-menu-item {
        background-color: #000000 !important;
        color: #ffffff !important;
        border: 1px solid #ffffff !important;
      }
      
      .quick-actions-toolbar button:hover,
      .quick-actions-context-menu .context-menu-item:hover {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      
      .quick-actions-toolbar button:focus,
      .quick-actions-context-menu .context-menu-item:focus {
        outline: 3px solid #ffff00 !important;
        outline-offset: 2px !important;
      }
    `;
    
    this.highContrastStyles.replaceSync(highContrastRules);
  }

  private createLargeTextStyles(): void {
    this.largeTextStyles = new CSSStyleSheet();
    
    // Large text styles
    const largeTextRules = `
      .quick-actions-toolbar,
      .quick-actions-context-menu,
      .quick-actions-popup {
        font-size: 18px !important;
        line-height: 1.5 !important;
      }
      
      .quick-actions-toolbar button {
        font-size: 18px !important;
        padding: 12px 16px !important;
        min-height: 48px !important;
      }
      
      .quick-actions-context-menu .context-menu-item {
        font-size: 18px !important;
        padding: 12px 16px !important;
        min-height: 48px !important;
      }
    `;
    
    this.largeTextStyles.replaceSync(largeTextRules);
  }

  private setupReducedMotionDetection(): void {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      this.options.reducedMotion = event.matches;
      this.applyReducedMotion();
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    // Set initial value
    this.options.reducedMotion = mediaQuery.matches;
  }

  private setupScreenReaderDetection(): void {
    // Detect screen reader usage
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        navigator.userAgent.includes('TalkBack') ||
        document.documentElement.getAttribute('data-screen-reader') === 'true';
      
      this.options.screenReader = hasScreenReader;
      this.applyScreenReaderOptimizations();
    };
    
    // Check immediately and on page load
    detectScreenReader();
    window.addEventListener('load', detectScreenReader);
  }

  private applyAccessibilitySettings(): void {
    // Apply high contrast if enabled
    if (this.options.highContrast) {
      this.applyHighContrast();
    }
    
    // Apply large text if enabled
    if (this.options.largeText) {
      this.applyLargeText();
    }
    
    // Apply reduced motion
    this.applyReducedMotion();
    
    // Apply screen reader optimizations
    this.applyScreenReaderOptimizations();
    
    // Apply focus visible settings
    this.applyFocusVisibleSettings();
  }

  private applyHighContrast(): void {
    if (this.highContrastStyles && !document.adoptedStyleSheets.includes(this.highContrastStyles)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.highContrastStyles];
    }
  }

  private removeHighContrast(): void {
    if (this.highContrastStyles) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== this.highContrastStyles);
    }
  }

  private applyLargeText(): void {
    if (this.largeTextStyles && !document.adoptedStyleSheets.includes(this.largeTextStyles)) {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.largeTextStyles];
    }
  }

  private removeLargeText(): void {
    if (this.largeTextStyles) {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== this.largeTextStyles);
    }
  }

  private applyReducedMotion(): void {
    if (this.options.reducedMotion) {
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.setProperty('--transition-duration', '0.2s');
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
  }

  private applyScreenReaderOptimizations(): void {
    if (this.options.screenReader) {
      // Add screen reader specific attributes
      this.addScreenReaderAttributes();
      
      // Ensure proper heading structure
      this.ensureHeadingStructure();
      
      // Add skip links
      this.addSkipLinks();
    }
  }

  private applyFocusVisibleSettings(): void {
    if (this.options.focusVisible) {
      // Ensure focus is always visible
      document.documentElement.style.setProperty('--focus-visible', 'auto');
    } else {
      document.documentElement.style.setProperty('--focus-visible', 'none');
    }
  }

  private addScreenReaderAttributes(): void {
    // Add ARIA landmarks
    const toolbar = document.getElementById('quick-actions-toolbar');
    if (toolbar) {
      toolbar.setAttribute('role', 'toolbar');
      toolbar.setAttribute('aria-label', 'Quick Actions Toolbar');
    }
    
    const contextMenu = document.getElementById('quick-actions-context-menu');
    if (contextMenu) {
      contextMenu.setAttribute('role', 'menu');
      contextMenu.setAttribute('aria-label', 'Quick Actions Menu');
    }
  }

  private ensureHeadingStructure(): void {
    // Ensure proper heading hierarchy in options page
    const optionsPage = document.querySelector('.options-page');
    if (optionsPage) {
      const sections = optionsPage.querySelectorAll('.section');
      sections.forEach((section, index) => {
        const title = section.querySelector('.section-title');
        if (title && !title.tagName.match(/^H[1-6]$/)) {
          const heading = document.createElement(`h${Math.min(index + 2, 6)}`);
          heading.textContent = title.textContent;
          heading.className = title.className;
          title.parentNode?.replaceChild(heading, title);
        }
      });
    }
  }

  private addSkipLinks(): void {
    // Add skip to main content link
    if (!document.getElementById('skip-to-main')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000000;
        color: #ffffff;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
        transition: top 0.3s;
      `;
      
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
      });
      
      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });
      
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }

  private setupPreferenceChangeListener(): void {
    // Listen for preference changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.userPreferences) {
        this.currentPreferences = changes.userPreferences.newValue;
        this.updateAccessibilityFromPreferences();
      }
    });
  }

  private updateAccessibilityFromPreferences(): void {
    // Update accessibility options based on user preferences
    const appearance = this.currentPreferences.appearance;
    
    if (appearance.theme === 'high-contrast') {
      this.options.highContrast = true;
      this.applyHighContrast();
    } else {
      this.options.highContrast = false;
      this.removeHighContrast();
    }
    
    if (appearance.largeText) {
      this.options.largeText = true;
      this.applyLargeText();
    } else {
      this.options.largeText = false;
      this.removeLargeText();
    }
  }

  // Public methods

  updateOptions(options: Partial<AccessibilityOptions>): void {
    this.options = { ...this.options, ...options };
    this.applyAccessibilitySettings();
  }

  enableHighContrast(): void {
    this.options.highContrast = true;
    this.applyHighContrast();
  }

  disableHighContrast(): void {
    this.options.highContrast = false;
    this.removeHighContrast();
  }

  enableLargeText(): void {
    this.options.largeText = true;
    this.applyLargeText();
  }

  disableLargeText(): void {
    this.options.largeText = false;
    this.removeLargeText();
  }

  toggleReducedMotion(): void {
    this.options.reducedMotion = !this.options.reducedMotion;
    this.applyReducedMotion();
  }

  // WCAG 2.1 AA compliance helpers

  ensureColorContrast(element: HTMLElement, minRatio: number = 4.5): boolean {
    // Check color contrast ratio
    const style = window.getComputedStyle(element);
    const backgroundColor = style.backgroundColor;
    const color = style.color;
    
    // Calculate contrast ratio (simplified)
    const ratio = this.calculateContrastRatio(backgroundColor, color);
    
    if (ratio < minRatio) {
      // Apply high contrast fallback
      element.style.setProperty('--fallback-color', '#000000');
      element.style.setProperty('--fallback-background', '#ffffff');
      return false;
    }
    
    return true;
  }

  private calculateContrastRatio(_bg: string, _fg: string): number {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder
  }

  ensureKeyboardAccessibility(element: HTMLElement): void {
    // Ensure element is keyboard accessible
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
    
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'button');
    }
    
    // Add keyboard event listeners
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  }

  addLiveRegion(element: HTMLElement, type: 'polite' | 'assertive' = 'polite'): void {
    // Add live region for screen readers
    element.setAttribute('aria-live', type);
    element.setAttribute('aria-atomic', 'true');
  }

  announceToScreenReader(message: string, type: 'polite' | 'assertive' = 'polite'): void {
    // Announce message to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', type);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    
    document.body.appendChild(announcement);
    
    // Announce the message
    announcement.textContent = message;
    
    // Remove after announcement
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.parentNode.removeChild(announcement);
      }
    }, 1000);
  }

  // Cleanup method
  cleanup(): void {
    // Remove stylesheets
    this.removeHighContrast();
    this.removeLargeText();
    
    // Reset options
    this.options = {
      enabled: false,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      focusVisible: false
    };
    
    this.isInitialized = false;
  }
}
