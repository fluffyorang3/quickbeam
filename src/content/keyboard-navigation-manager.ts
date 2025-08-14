export interface KeyboardNavigationOptions {
  enabled: boolean;
  enableTabNavigation: boolean;
  enableArrowKeys: boolean;
  enableShortcuts: boolean;
  focusIndicator: boolean;
}

export class KeyboardNavigationManager {
  private isInitialized = false;
  private options: KeyboardNavigationOptions;
  private currentFocusIndex: number = -1;
  private focusableElements: HTMLElement[] = [];

  constructor() {
    this.options = {
      enabled: true,
      enableTabNavigation: true,
      enableArrowKeys: true,
      enableShortcuts: true,
      focusIndicator: true
    };
  }

  initialize(): void {
    if (this.isInitialized) return;

    this.setupKeyboardListeners();
    this.isInitialized = true;
    console.log('KeyboardNavigationManager initialized');
  }

  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.options.enabled) return;

      switch (event.key) {
        case 'Tab':
          if (this.options.enableTabNavigation) {
            event.preventDefault();
            this.handleTabNavigation(event.shiftKey);
          }
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          if (this.options.enableArrowKeys) {
            event.preventDefault();
            this.navigatePrevious();
          }
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          if (this.options.enableArrowKeys) {
            event.preventDefault();
            this.navigateNext();
          }
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateCurrentElement();
          break;

        case 'Escape':
          event.preventDefault();
          this.clearFocus();
          break;
      }
    });
  }

  private handleTabNavigation(shiftKey: boolean): void {
    if (this.focusableElements.length === 0) return;

    if (shiftKey) {
      this.currentFocusIndex = this.currentFocusIndex <= 0
        ? this.focusableElements.length - 1
        : this.currentFocusIndex - 1;
    } else {
      this.currentFocusIndex = this.currentFocusIndex >= this.focusableElements.length - 1
        ? 0
        : this.currentFocusIndex + 1;
    }

    this.focusElementAtIndex(this.currentFocusIndex);
  }

  private navigatePrevious(): void {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = this.currentFocusIndex <= 0
      ? this.focusableElements.length - 1
      : this.currentFocusIndex - 1;

    this.focusElementAtIndex(this.currentFocusIndex);
  }

  private navigateNext(): void {
    if (this.focusableElements.length === 0) return;

    this.currentFocusIndex = this.currentFocusIndex >= this.focusableElements.length - 1
      ? 0
      : this.currentFocusIndex + 1;

    this.focusElementAtIndex(this.currentFocusIndex);
  }

  private focusElementAtIndex(index: number): void {
    if (index < 0 || index >= this.focusableElements.length) return;

    const element = this.focusableElements[index];
    
    // Remove focus from all elements
    this.focusableElements.forEach(el => {
      el.classList.remove('keyboard-focused');
      el.setAttribute('tabindex', '-1');
    });

    // Focus current element
    element.focus();
    element.classList.add('keyboard-focused');
    element.setAttribute('tabindex', '0');

    // Add focus indicator if enabled
    if (this.options.focusIndicator) {
      element.style.outline = '2px solid #007acc';
      element.style.outlineOffset = '2px';
    }
  }

  private activateCurrentElement(): void {
    if (this.focusableElements.length === 0) return;

    const currentElement = this.getCurrentFocusedElement();
    if (currentElement) {
      currentElement.click();
    }
  }

  private clearFocus(): void {
    this.focusableElements.forEach(el => {
      el.classList.remove('keyboard-focused');
      el.setAttribute('tabindex', '-1');
      el.style.outline = '';
      el.style.outlineOffset = '';
    });
    this.currentFocusIndex = -1;
  }

  setFocusableElements(elements: HTMLElement[]): void {
    this.focusableElements = elements;
    this.currentFocusIndex = -1;

    // Set initial focus if elements exist
    if (this.focusableElements.length > 0) {
      this.currentFocusIndex = 0;
      this.focusElementAtIndex(this.currentFocusIndex);
    }
  }

  getCurrentFocusedElement(): HTMLElement | null {
    if (this.focusableElements.length > 0) {
      return this.focusableElements[this.currentFocusIndex];
    }
    return null;
  }

  updateOptions(options: Partial<KeyboardNavigationOptions>): void {
    this.options = { ...this.options, ...options };
  }

  enable(): void {
    this.options.enabled = true;
  }

  disable(): void {
    this.options.enabled = false;
    this.clearFocus();
  }

  isEnabled(): boolean {
    return this.options.enabled;
  }

  getCurrentFocusIndex(): number {
    return this.currentFocusIndex;
  }

  getFocusableElementsCount(): number {
    return this.focusableElements.length;
  }

  cleanup(): void {
    this.clearFocus();
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.isInitialized = false;
  }
}
