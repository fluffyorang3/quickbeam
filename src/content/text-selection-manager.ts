export class TextSelectionManager {
  private selectionChangeCallback?: (selection: string) => void;
  private currentSelection: string = '';
  private debounceTimeout?: NodeJS.Timeout;
  private isInitialized = false;
  private observer?: MutationObserver;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize text selection event listeners
      this.setupSelectionListeners();
      
      // Initialize mutation observer for dynamic content
      this.setupMutationObserver();
      
      this.isInitialized = true;
      console.log('TextSelectionManager initialized');
    } catch (error) {
      console.error('Failed to initialize TextSelectionManager:', error);
      throw error;
    }
  }

  private setupSelectionListeners(): void {
    // Listen for selection changes
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    
    // Listen for mouse up events (common for text selection)
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Listen for key up events (for keyboard selection)
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Listen for touch end events (for mobile)
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  private setupMutationObserver(): void {
    // Observe DOM changes to handle dynamic content
    this.observer = new MutationObserver(() => {
      // Check if selection is still valid after DOM changes
      this.validateCurrentSelection();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  private handleSelectionChange(): void {
    // Debounce selection changes to avoid excessive processing
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.debounceTimeout = setTimeout(() => {
      this.processSelectionChange();
    }, 50); // 50ms debounce for performance
  }

  private handleMouseUp(): void {
    // Check if text was selected
    setTimeout(() => {
      this.processSelectionChange();
    }, 10);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Check for keyboard selection (Shift + Arrow keys, Ctrl+A, etc.)
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      setTimeout(() => {
        this.processSelectionChange();
      }, 10);
    }
  }

  private handleTouchEnd(): void {
    // Check for touch selection on mobile
    setTimeout(() => {
      this.processSelectionChange();
    }, 100);
  }

  private processSelectionChange(): void {
    const selection = this.getSelectionText();
    
    // Only process if selection actually changed
    if (selection !== this.currentSelection) {
      this.currentSelection = selection;
      
      // Notify callback if set
      if (this.selectionChangeCallback) {
        this.selectionChangeCallback(selection);
      }
    }
  }

  private getSelectionText(): string {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return '';
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();
    
    return text;
  }

  private validateCurrentSelection(): void {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.currentSelection = '';
      if (this.selectionChangeCallback) {
        this.selectionChangeCallback('');
      }
      return;
    }

    // Check if the selection is still valid
    const range = selection.getRangeAt(0);
    if (!this.isRangeValid(range)) {
      this.currentSelection = '';
      if (this.selectionChangeCallback) {
        this.selectionChangeCallback('');
      }
    }
  }

  private isRangeValid(range: Range): boolean {
    try {
      // Check if the range is still in the document
      const container = range.commonAncestorContainer;
      return document.contains(container);
    } catch (error) {
      return false;
    }
  }

  onSelectionChange(callback: (selection: string) => void): void {
    this.selectionChangeCallback = callback;
  }

  getCurrentSelection(): string {
    return this.currentSelection;
  }

  getSelectionRange(): Range | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    return selection.getRangeAt(0);
  }

  getSelectionPosition(): { x: number; y: number } | null {
    const range = this.getSelectionRange();
    if (!range) {
      return null;
    }

    try {
      const rect = range.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    } catch (error) {
      return null;
    }
  }

  clearSelection(): void {
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    this.currentSelection = '';
  }

  cleanup(): void {
    // Remove event listeners
    document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Disconnect mutation observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Clear timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    
    this.isInitialized = false;
  }
}
