import { QuickAction, ActionType } from '../types';
import { PatternRecognitionEngine } from './pattern-recognition-engine';
import { ActionButtonManager } from './action-button-manager';

export interface ContextMenuOptions {
  enabled: boolean;
  showOnRightClick: boolean;
  includeDefaultActions: boolean;
}

export class ContextMenuManager {
  private isInitialized = false;
  private contextMenuElement: HTMLElement | null = null;
  private patternRecognitionEngine: PatternRecognitionEngine;
  private actionButtonManager: ActionButtonManager;
  private options: ContextMenuOptions;
  private currentSelection: string = '';
  private currentActions: QuickAction[] = [];

  constructor(
    patternRecognitionEngine: PatternRecognitionEngine,
    actionButtonManager: ActionButtonManager
  ) {
    this.patternRecognitionEngine = patternRecognitionEngine;
    this.actionButtonManager = actionButtonManager;
    this.options = {
      enabled: true,
      showOnRightClick: true,
      includeDefaultActions: true
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create context menu element
      this.createContextMenuElement();
      
      // Add to DOM
      document.body.appendChild(this.contextMenuElement!);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Hide initially
      this.hide();
      
      this.isInitialized = true;
      console.log('ContextMenuManager initialized');
    } catch (error) {
      console.error('Failed to initialize ContextMenuManager:', error);
      throw error;
    }
  }

  private createContextMenuElement(): void {
    this.contextMenuElement = document.createElement('div');
    this.contextMenuElement.id = 'quick-actions-context-menu';
    this.contextMenuElement.className = 'quick-actions-context-menu';
    
    // Set initial styles
    Object.assign(this.contextMenuElement.style, {
      position: 'fixed',
      zIndex: '999999',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      padding: '8px 0',
      display: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '14px',
      lineHeight: '1.4',
      userSelect: 'none',
      pointerEvents: 'auto',
      minWidth: '200px',
      maxWidth: '300px'
    });
  }

  private setupEventListeners(): void {
    // Listen for right-click events
    document.addEventListener('contextmenu', (event) => {
      if (!this.options.enabled || !this.options.showOnRightClick) return;
      
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        this.showContextMenu(event, selection);
      }
    });

    // Listen for clicks outside to hide menu
    document.addEventListener('click', (event) => {
      if (this.contextMenuElement && !this.contextMenuElement.contains(event.target as Node)) {
        this.hide();
      }
    });

    // Listen for escape key to hide menu
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.hide();
      }
    });
  }

  private async showContextMenu(event: MouseEvent, selection: string): Promise<void> {
    if (!this.contextMenuElement) return;

    event.preventDefault();
    
    this.currentSelection = selection;
    
    // Get actions for the selected text
    this.currentActions = await this.getActionsForText(selection);
    
    // Build context menu content
    this.buildContextMenuContent();
    
    // Position the menu
    this.positionContextMenu(event.clientX, event.clientY);
    
    // Show the menu
    this.show();
  }

  private async getActionsForText(text: string): Promise<QuickAction[]> {
    try {
      // Get pattern matches
      const patterns = await this.patternRecognitionEngine.detectPatterns(text);
      
      // Get available actions based on patterns and preferences
      const actions = this.actionButtonManager.getAvailableActions(patterns);
      
      // Add default actions if enabled
      if (this.options.includeDefaultActions) {
        const defaultActions = [
          { id: 'copy', name: 'Copy', type: ActionType.COPY },
          { id: 'search', name: 'Search', type: ActionType.SEARCH }
        ];
        
        defaultActions.forEach(defaultAction => {
          if (!actions.find(action => action.id === defaultAction.id)) {
            actions.push({
              ...defaultAction,
              description: `Copy "${text}" to clipboard`,
              icon: '📋',
              enabled: true,
              execute: async (text: string) => {
                await navigator.clipboard.writeText(text);
              }
            } as QuickAction);
          }
        });
      }
      
      return actions;
    } catch (error) {
      console.error('Failed to get actions for text:', error);
      return [];
    }
  }

  private buildContextMenuContent(): void {
    if (!this.contextMenuElement) return;

    // Clear existing content
    this.contextMenuElement.innerHTML = '';

    // Add header
    const header = document.createElement('div');
    header.className = 'context-menu-header';
    header.style.cssText = `
      padding: 8px 16px;
      border-bottom: 1px solid #e0e0e0;
      font-weight: 600;
      color: #333333;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    header.textContent = 'Quick Actions';
    this.contextMenuElement.appendChild(header);

    // Add actions
    this.currentActions.forEach(action => {
      if (!action.enabled) return;

      const actionItem = document.createElement('div');
      actionItem.className = 'context-menu-item';
      actionItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background-color 0.2s;
      `;
      
      actionItem.innerHTML = `
        <span class="action-icon" style="font-size: 16px;">${action.icon}</span>
        <span class="action-name">${action.name}</span>
      `;

      // Add hover effect
      actionItem.addEventListener('mouseenter', () => {
        actionItem.style.backgroundColor = '#f5f5f5';
      });
      
      actionItem.addEventListener('mouseleave', () => {
        actionItem.style.backgroundColor = 'transparent';
      });

      // Add click handler
      actionItem.addEventListener('click', async () => {
        try {
          await action.execute(this.currentSelection);
          this.hide();
        } catch (error) {
          console.error(`Failed to execute action ${action.name}:`, error);
        }
      });

      this.contextMenuElement!.appendChild(actionItem);
    });

    // Add separator and settings link
    if (this.currentActions.length > 0) {
      const separator = document.createElement('div');
      separator.style.cssText = `
        height: 1px;
        background-color: #e0e0e0;
        margin: 8px 0;
      `;
      this.contextMenuElement.appendChild(separator);
    }

    const settingsItem = document.createElement('div');
    settingsItem.className = 'context-menu-item';
    settingsItem.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666666;
      font-size: 12px;
      transition: background-color 0.2s;
    `;
    
    settingsItem.innerHTML = `
      <span class="action-icon" style="font-size: 14px;">⚙️</span>
      <span class="action-name">Settings</span>
    `;

    settingsItem.addEventListener('mouseenter', () => {
      settingsItem.style.backgroundColor = '#f5f5f5';
    });
    
    settingsItem.addEventListener('mouseleave', () => {
      settingsItem.style.backgroundColor = 'transparent';
    });

    settingsItem.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      this.hide();
    });

    this.contextMenuElement.appendChild(settingsItem);
  }

  private positionContextMenu(x: number, y: number): void {
    if (!this.contextMenuElement) return;

    const rect = this.contextMenuElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate position to keep menu within viewport
    let finalX = x;
    let finalY = y;

    // Adjust horizontal position if menu would go off-screen
    if (x + rect.width > viewportWidth) {
      finalX = x - rect.width;
    }

    // Adjust vertical position if menu would go off-screen
    if (y + rect.height > viewportHeight) {
      finalY = y - rect.height;
    }

    // Ensure minimum position values
    finalX = Math.max(0, finalX);
    finalY = Math.max(0, finalY);

    this.contextMenuElement.style.left = `${finalX}px`;
    this.contextMenuElement.style.top = `${finalY}px`;
  }

  show(): void {
    if (this.contextMenuElement) {
      this.contextMenuElement.style.display = 'block';
    }
  }

  hide(): void {
    if (this.contextMenuElement) {
      this.contextMenuElement.style.display = 'none';
    }
  }

  updateOptions(options: Partial<ContextMenuOptions>): void {
    this.options = { ...this.options, ...options };
  }

  cleanup(): void {
    if (this.contextMenuElement && this.contextMenuElement.parentNode) {
      this.contextMenuElement.parentNode.removeChild(this.contextMenuElement);
    }
    this.contextMenuElement = null;
    this.isInitialized = false;
  }
}
