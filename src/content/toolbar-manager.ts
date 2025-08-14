import { PERFORMANCE_THRESHOLDS, DEFAULT_PREFERENCES } from '../constants';
import { QuickAction, ActionType } from '../types';

export interface ToolbarPosition {
  x: number;
  y: number;
  position: 'above' | 'below' | 'adjacent';
}

export interface ToolbarOptions {
  position?: 'above' | 'below' | 'adjacent';
  autoHide?: boolean;
  hideDelay?: number;
  showIcons?: boolean;
  compactMode?: boolean;
}

export class ToolbarManager {
  private toolbarElement: HTMLElement | null = null;
  private actionExecuteCallback?: (action: QuickAction) => void;
  private hideTimeout?: NodeJS.Timeout;
  private isVisible = false;
  private isInitialized = false;
  private options: ToolbarOptions;
  private currentActions: QuickAction[] = [];
  private currentSelection: string = '';

  constructor() {
    this.options = {
      position: DEFAULT_PREFERENCES.toolbar.position,
      autoHide: DEFAULT_PREFERENCES.toolbar.autoHide,
      hideDelay: DEFAULT_PREFERENCES.toolbar.hideDelay,
      showIcons: DEFAULT_PREFERENCES.appearance.showIcons,
      compactMode: DEFAULT_PREFERENCES.appearance.compactMode
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create toolbar element
      this.createToolbarElement();
      
      // Add to DOM
      document.body.appendChild(this.toolbarElement!);
      
      // Set initial styles
      this.updateToolbarStyles();
      
      // Hide initially
      this.hide();
      
      this.isInitialized = true;
      console.log('ToolbarManager initialized');
    } catch (error) {
      console.error('Failed to initialize ToolbarManager:', error);
      throw error;
    }
  }

  private createToolbarElement(): void {
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.id = 'quick-actions-toolbar';
    this.toolbarElement.className = 'quick-actions-toolbar';
    
    // Set initial styles
    Object.assign(this.toolbarElement.style, {
      position: 'fixed',
      zIndex: '999999',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '8px',
      display: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
      userSelect: 'none',
      pointerEvents: 'auto'
    });
  }

  private updateToolbarStyles(): void {
    if (!this.toolbarElement) return;

    const isCompact = this.options.compactMode;

    // Update padding based on compact mode
    this.toolbarElement.style.padding = isCompact ? '6px' : '8px';
    
    // Update font size based on compact mode
    this.toolbarElement.style.fontSize = isCompact ? '12px' : '14px';
  }

  show(actions: QuickAction[], selectedText: string): void {
    if (!this.isInitialized || !this.toolbarElement) return;

    const startTime = performance.now();
    
    try {
      this.currentActions = actions;
      this.currentSelection = selectedText;
      
      // Clear previous content
      this.toolbarElement.innerHTML = '';
      
      // Create action buttons
      this.createActionButtons(actions);
      
      // Position toolbar
      this.positionToolbar();
      
      // Show toolbar
      this.toolbarElement.style.display = 'block';
      this.isVisible = true;
      
      // Set auto-hide if enabled
      if (this.options.autoHide) {
        this.scheduleAutoHide();
      }
      
      const duration = performance.now() - startTime;
      if (duration > PERFORMANCE_THRESHOLDS.TOOLBAR_APPEARANCE) {
        console.warn(`Toolbar appearance took ${duration.toFixed(2)}ms, exceeding threshold of ${PERFORMANCE_THRESHOLDS.TOOLBAR_APPEARANCE}ms`);
      }
      
      console.log(`Toolbar shown with ${actions.length} actions`);
    } catch (error) {
      console.error('Error showing toolbar:', error);
    }
  }

  hide(): void {
    if (!this.isInitialized || !this.toolbarElement) return;

    // Clear auto-hide timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
    
    // Hide toolbar
    this.toolbarElement.style.display = 'none';
    this.isVisible = false;
    
    // Clear current state
    this.currentActions = [];
    this.currentSelection = '';
    
    console.log('Toolbar hidden');
  }

  private createActionButtons(actions: QuickAction[]): void {
    if (!this.toolbarElement) return;

    actions.forEach(action => {
      const button = this.createActionButton(action);
      this.toolbarElement!.appendChild(button);
    });
  }

  private createActionButton(action: QuickAction): HTMLElement {
    const button = document.createElement('button');
    button.className = 'quick-action-button';
    button.setAttribute('data-action-id', action.id);
    button.setAttribute('data-action-type', action.type);
    button.setAttribute('aria-label', action.description);
    
    // Set button styles
    Object.assign(button.style, {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      margin: '0 2px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#f8f9fa',
      color: '#212529',
      cursor: 'pointer',
      fontSize: 'inherit',
      fontFamily: 'inherit',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    });
    
    // Add icon if enabled
    if (this.options.showIcons) {
      const icon = this.createActionIcon(action);
      button.appendChild(icon);
    }
    
    // Add text
    const text = document.createElement('span');
    text.textContent = action.name;
    button.appendChild(text);
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#e9ecef';
      button.style.transform = 'translateY(-1px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = '#f8f9fa';
      button.style.transform = 'translateY(0)';
    });
    
    // Add click handler
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.handleActionClick(action);
    });
    
    return button;
  }

  private createActionIcon(action: QuickAction): HTMLElement {
    const icon = document.createElement('span');
    icon.className = 'quick-action-icon';
    
    // Set icon styles
    Object.assign(icon.style, {
      width: '16px',
      height: '16px',
      display: 'inline-block',
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    });
    
    // Set icon based on action type
    const iconMap: Record<ActionType, string> = {
      [ActionType.MAP_IT]: '🗺️',
      [ActionType.EMAIL]: '✉️',
      [ActionType.CALENDAR]: '📅',
      [ActionType.TRACK_PACKAGE]: '📦',
      [ActionType.CALL]: '📞',
      [ActionType.MESSAGE]: '💬',
      [ActionType.COPY]: '📋',
      [ActionType.SEARCH]: '🔍',
      [ActionType.CONVERT]: '🔄',
      [ActionType.TRANSLATE]: '🌐',
      [ActionType.DEFINE]: '📚',
      [ActionType.QUICK_NOTE]: '📝',
      [ActionType.SHARE]: '📤'
    };
    
    icon.textContent = iconMap[action.type] || '⚡';
    
    return icon;
  }

  private handleActionClick(action: QuickAction): void {
    try {
      // Notify callback
      if (this.actionExecuteCallback) {
        this.actionExecuteCallback(action);
      }
      
      // Hide toolbar after action
      this.hide();
    } catch (error) {
      console.error('Error handling action click:', error);
    }
  }

  private positionToolbar(): void {
    if (!this.toolbarElement) return;

    // Get selection position
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.positionAtCursor();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate position based on preferences
    const position = this.calculateToolbarPosition(rect);
    
    // Apply position
    this.toolbarElement.style.left = `${position.x}px`;
    this.toolbarElement.style.top = `${position.y}px`;
    
    // Ensure toolbar is within viewport
    this.ensureToolbarInViewport();
  }

  private calculateToolbarPosition(selectionRect: DOMRect): ToolbarPosition {
    const toolbarRect = this.toolbarElement!.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let x: number;
    let y: number;
    let position: 'above' | 'below' | 'adjacent' = this.options.position || 'adjacent';
    
    // Calculate horizontal position
    if (position === 'adjacent') {
      // Position to the right of selection, or left if not enough space
      if (selectionRect.right + toolbarRect.width + 10 <= viewportWidth) {
        x = selectionRect.right + 10;
      } else if (selectionRect.left - toolbarRect.width - 10 >= 0) {
        x = selectionRect.left - toolbarRect.width - 10;
      } else {
        // Center horizontally if no space on sides
        x = Math.max(10, (viewportWidth - toolbarRect.width) / 2);
      }
    } else {
      // Center horizontally for above/below positioning
      x = Math.max(10, (viewportWidth - toolbarRect.width) / 2);
    }
    
    // Calculate vertical position
    if (position === 'above') {
      y = Math.max(10, selectionRect.top - toolbarRect.height - 10);
    } else if (position === 'below') {
      y = Math.min(viewportHeight - toolbarRect.height - 10, selectionRect.bottom + 10);
    } else {
      // Adjacent positioning - align with selection
      y = Math.max(10, Math.min(viewportHeight - toolbarRect.height - 10, selectionRect.top));
    }
    
    return { x, y, position };
  }

  private positionAtCursor(): void {
    // Fallback positioning at cursor location
    const x = Math.max(10, (window.innerWidth - 200) / 2);
    const y = Math.max(10, (window.innerHeight - 100) / 2);
    
    if (this.toolbarElement) {
      this.toolbarElement.style.left = `${x}px`;
      this.toolbarElement.style.top = `${y}px`;
    }
  }

  private ensureToolbarInViewport(): void {
    if (!this.toolbarElement) return;

    const rect = this.toolbarElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let needsReposition = false;
    let newX = parseInt(this.toolbarElement.style.left || '0');
    let newY = parseInt(this.toolbarElement.style.top || '0');
    
    // Check horizontal bounds
    if (rect.left < 10) {
      newX = 10;
      needsReposition = true;
    } else if (rect.right > viewportWidth - 10) {
      newX = viewportWidth - rect.width - 10;
      needsReposition = true;
    }
    
    // Check vertical bounds
    if (rect.top < 10) {
      newY = 10;
      needsReposition = true;
    } else if (rect.bottom > viewportHeight - 10) {
      newY = viewportHeight - rect.height - 10;
      needsReposition = true;
    }
    
    // Apply repositioning if needed
    if (needsReposition) {
      this.toolbarElement.style.left = `${newX}px`;
      this.toolbarElement.style.top = `${newY}px`;
    }
  }

  private scheduleAutoHide(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, this.options.hideDelay || 3000);
  }

  onActionExecute(callback: (action: QuickAction) => void): void {
    this.actionExecuteCallback = callback;
  }

  updateOptions(newOptions: Partial<ToolbarOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.updateToolbarStyles();
  }

  isToolbarVisible(): boolean {
    return this.isVisible;
  }

  getCurrentActions(): QuickAction[] {
    return [...this.currentActions];
  }

  getCurrentSelection(): string {
    return this.currentSelection;
  }

  updatePreferences(toolbarPreferences: any): void {
    // Update toolbar options based on user preferences
    this.options = {
      ...this.options,
      position: toolbarPreferences.position || this.options.position,
      autoHide: toolbarPreferences.autoHide !== undefined ? toolbarPreferences.autoHide : this.options.autoHide,
      hideDelay: toolbarPreferences.hideDelay || this.options.hideDelay,
      showIcons: toolbarPreferences.showIcons !== undefined ? toolbarPreferences.showIcons : this.options.showIcons,
      compactMode: toolbarPreferences.compactMode !== undefined ? toolbarPreferences.compactMode : this.options.compactMode
    };
    
    // Update toolbar styles if visible
    if (this.isVisible) {
      this.updateToolbarStyles();
    }
  }

  // New methods for enhanced customization

  setTheme(theme: 'light' | 'dark' | 'auto' | 'high-contrast'): void {
    if (!this.toolbarElement) return;

    if (theme === 'high-contrast') {
      this.toolbarElement.style.backgroundColor = '#000000';
      this.toolbarElement.style.color = '#ffffff';
      this.toolbarElement.style.borderColor = '#ffffff';
    } else {
      const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        this.toolbarElement.style.backgroundColor = '#2d2d2d';
        this.toolbarElement.style.color = '#ffffff';
        this.toolbarElement.style.borderColor = '#555555';
      } else {
        this.toolbarElement.style.backgroundColor = '#ffffff';
        this.toolbarElement.style.color = '#333333';
        this.toolbarElement.style.borderColor = '#e0e0e0';
      }
    }
  }

  setCustomColors(primaryColor: string, backgroundColor: string, textColor: string): void {
    if (!this.toolbarElement) return;

    this.toolbarElement.style.backgroundColor = backgroundColor;
    this.toolbarElement.style.color = textColor;
    this.toolbarElement.style.borderColor = primaryColor;
    
    // Update button styles
    const buttons = this.toolbarElement.querySelectorAll('button');
    buttons.forEach(button => {
      (button as HTMLElement).style.backgroundColor = primaryColor;
      (button as HTMLElement).style.color = textColor;
    });
  }

  setPosition(position: 'above' | 'below' | 'adjacent'): void {
    this.options.position = position;
    if (this.isVisible) {
      this.positionToolbar();
    }
  }

  setAutoHide(enabled: boolean, delay?: number): void {
    this.options.autoHide = enabled;
    if (delay !== undefined) {
      this.options.hideDelay = delay;
    }
    
    if (enabled && this.isVisible) {
      this.scheduleAutoHide();
    } else if (!enabled && this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }

  setCompactMode(enabled: boolean): void {
    this.options.compactMode = enabled;
    this.updateToolbarStyles();
  }

  setShowIcons(enabled: boolean): void {
    this.options.showIcons = enabled;
    this.updateToolbarStyles();
  }

  // Accessibility methods

  makeAccessible(): void {
    if (!this.toolbarElement) return;

    // Set ARIA attributes
    this.toolbarElement.setAttribute('role', 'toolbar');
    this.toolbarElement.setAttribute('aria-label', 'Quick Actions Toolbar');
    
    // Make buttons focusable and accessible
    const buttons = this.toolbarElement.querySelectorAll('button');
    buttons.forEach((button) => {
      const buttonElement = button as HTMLElement;
      
      // Set tabindex for keyboard navigation
      buttonElement.setAttribute('tabindex', '0');
      
      // Set ARIA labels
      const buttonText = buttonElement.textContent?.trim();
      if (buttonText) {
        buttonElement.setAttribute('aria-label', buttonText);
      }
      
      // Set role
      buttonElement.setAttribute('role', 'button');
      
      // Add keyboard support
      buttonElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          buttonElement.click();
        }
      });
    });
  }

  focusFirstButton(): void {
    if (!this.toolbarElement) return;
    
    const firstButton = this.toolbarElement.querySelector('button') as HTMLElement;
    if (firstButton) {
      firstButton.focus();
    }
  }

  focusLastButton(): void {
    if (!this.toolbarElement) return;
    
    const buttons = this.toolbarElement.querySelectorAll('button');
    const lastButton = buttons[buttons.length - 1] as HTMLElement;
    if (lastButton) {
      lastButton.focus();
    }
  }

  // Animation and transition methods

  setAnimationSpeed(speed: 'fast' | 'normal' | 'slow' | 'none'): void {
    if (!this.toolbarElement) return;

    const speeds = {
      fast: '0.1s',
      normal: '0.2s',
      slow: '0.5s',
      none: '0s'
    };

    this.toolbarElement.style.transition = `all ${speeds[speed]} ease-in-out`;
  }

  addEntranceAnimation(animation: 'fade' | 'slide' | 'scale' | 'none'): void {
    if (!this.toolbarElement) return;

    // Remove existing animation classes
    this.toolbarElement.classList.remove('fade-in', 'slide-in', 'scale-in');
    
    // Add new animation class
    if (animation !== 'none') {
      this.toolbarElement.classList.add(`${animation}-in`);
    }
  }

  // Performance optimization methods

  enableLazyLoading(): void {
    // Implement lazy loading for toolbar content
    if (!this.toolbarElement) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Load toolbar content when visible
          this.loadToolbarContent();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(this.toolbarElement);
  }

  private loadToolbarContent(): void {
    // Load any deferred content
    console.log('Loading toolbar content...');
  }

  // Cleanup method
  cleanup(): void {
    // Clear timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    // Remove toolbar from DOM
    if (this.toolbarElement && this.toolbarElement.parentNode) {
      this.toolbarElement.parentNode.removeChild(this.toolbarElement);
    }
    
    // Reset state
    this.toolbarElement = null;
    this.isVisible = false;
    this.isInitialized = false;
    this.currentActions = [];
    this.currentSelection = '';
  }
}
