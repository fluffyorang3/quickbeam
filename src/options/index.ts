// Options page entry point
import { EXTENSION_CONFIG, DEFAULT_PREFERENCES, STORAGE_KEYS } from '../constants';
import { UserPreferences } from '../types';

console.log(`${EXTENSION_CONFIG.NAME} v${EXTENSION_CONFIG.VERSION} options page loaded`);

class OptionsPageManager {
  private currentPreferences: UserPreferences = DEFAULT_PREFERENCES;
  private formElements: Map<string, HTMLElement> = new Map();

  async initialize(): Promise<void> {
    try {
      // Load current preferences
      await this.loadPreferences();
      
      // Initialize form elements
      this.initializeFormElements();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Apply current preferences to form
      this.applyPreferencesToForm();
      
      console.log('Options page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize options page:', error);
      this.showError('Failed to load settings. Please refresh the page.');
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
    } catch (error) {
      console.error('Failed to load preferences:', error);
      // Use default preferences if storage fails
    }
  }

  private initializeFormElements(): void {
    // Toolbar settings
    this.formElements.set('toolbarPosition', document.getElementById('toolbarPosition') as HTMLSelectElement);
    this.formElements.set('autoHide', document.getElementById('autoHide') as HTMLInputElement);
    this.formElements.set('hideDelay', document.getElementById('hideDelay') as HTMLInputElement);

    // Quick actions
    this.formElements.set('actionMap', document.getElementById('actionMap') as HTMLInputElement);
    this.formElements.set('actionEmail', document.getElementById('actionEmail') as HTMLInputElement);
    this.formElements.set('actionCall', document.getElementById('actionCall') as HTMLInputElement);
    this.formElements.set('actionTrack', document.getElementById('actionTrack') as HTMLInputElement);
    this.formElements.set('actionConvert', document.getElementById('actionConvert') as HTMLInputElement);

    // Privacy settings
    this.formElements.set('localProcessing', document.getElementById('localProcessing') as HTMLInputElement);
    this.formElements.set('dataCollection', document.getElementById('dataCollection') as HTMLInputElement);
    this.formElements.set('analytics', document.getElementById('analytics') as HTMLInputElement);

    // Buttons
    this.formElements.set('resetDefaults', document.getElementById('resetDefaults') as HTMLButtonElement);
    this.formElements.set('saveSettings', document.getElementById('saveSettings') as HTMLButtonElement);
  }

  private setupEventListeners(): void {
    // Save settings button
    const saveButton = this.formElements.get('saveSettings') as HTMLButtonElement;
    if (saveButton) {
      saveButton.addEventListener('click', () => this.saveSettings());
    }

    // Reset defaults button
    const resetButton = this.formElements.get('resetDefaults') as HTMLButtonElement;
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetToDefaults());
    }

    // Auto-hide checkbox
    const autoHideCheckbox = this.formElements.get('autoHide') as HTMLInputElement;
    const hideDelayInput = this.formElements.get('hideDelay') as HTMLInputElement;
    if (autoHideCheckbox && hideDelayInput) {
      autoHideCheckbox.addEventListener('change', () => {
        hideDelayInput.disabled = !autoHideCheckbox.checked;
      });
    }
  }

  private applyPreferencesToForm(): void {
    // Toolbar settings
    const toolbarPosition = this.formElements.get('toolbarPosition') as HTMLSelectElement;
    if (toolbarPosition) {
      toolbarPosition.value = this.currentPreferences.toolbar.position;
    }

    const autoHide = this.formElements.get('autoHide') as HTMLInputElement;
    if (autoHide) {
      autoHide.checked = this.currentPreferences.toolbar.autoHide;
    }

    const hideDelay = this.formElements.get('hideDelay') as HTMLInputElement;
    if (hideDelay) {
      hideDelay.value = (this.currentPreferences.toolbar.hideDelay / 1000).toString();
      hideDelay.disabled = !this.currentPreferences.toolbar.autoHide;
    }

    // Quick actions
    const actionMap = this.formElements.get('actionMap') as HTMLInputElement;
    if (actionMap) {
      actionMap.checked = this.currentPreferences.actions.enabledActions.includes('map_it');
    }

    const actionEmail = this.formElements.get('actionEmail') as HTMLInputElement;
    if (actionEmail) {
      actionEmail.checked = this.currentPreferences.actions.enabledActions.includes('email');
    }

    const actionCall = this.formElements.get('actionCall') as HTMLInputElement;
    if (actionCall) {
      actionCall.checked = this.currentPreferences.actions.enabledActions.includes('call');
    }

    const actionTrack = this.formElements.get('actionTrack') as HTMLInputElement;
    if (actionTrack) {
      actionTrack.checked = this.currentPreferences.actions.enabledActions.includes('track_package');
    }

    const actionConvert = this.formElements.get('actionConvert') as HTMLInputElement;
    if (actionConvert) {
      actionConvert.checked = this.currentPreferences.actions.enabledActions.includes('convert');
    }

    // Privacy settings
    const localProcessing = this.formElements.get('localProcessing') as HTMLInputElement;
    if (localProcessing) {
      localProcessing.checked = this.currentPreferences.privacy.localProcessingOnly;
    }

    const dataCollection = this.formElements.get('dataCollection') as HTMLInputElement;
    if (dataCollection) {
      dataCollection.checked = this.currentPreferences.privacy.dataCollection;
    }

    const analytics = this.formElements.get('analytics') as HTMLInputElement;
    if (analytics) {
      analytics.checked = this.currentPreferences.privacy.analytics;
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      // Collect form values
      const newPreferences: UserPreferences = {
        ...this.currentPreferences,
        toolbar: {
          position: (this.formElements.get('toolbarPosition') as HTMLSelectElement)?.value as any || 'adjacent',
          autoHide: (this.formElements.get('autoHide') as HTMLInputElement)?.checked || false,
          hideDelay: parseInt((this.formElements.get('hideDelay') as HTMLInputElement)?.value || '3') * 1000,
          showOnSelection: true
        },
        actions: {
          ...this.currentPreferences.actions,
          enabledActions: this.getEnabledActions()
        },
        privacy: {
          localProcessingOnly: (this.formElements.get('localProcessing') as HTMLInputElement)?.checked || false,
          dataCollection: (this.formElements.get('dataCollection') as HTMLInputElement)?.checked || false,
          analytics: (this.formElements.get('analytics') as HTMLInputElement)?.checked || false,
          cloudProcessing: false
        }
      };

      // Save to storage
      await chrome.storage.sync.set({
        [STORAGE_KEYS.USER_PREFERENCES]: newPreferences
      });

      // Update current preferences
      this.currentPreferences = newPreferences;

      // Show success message
      this.showSuccess('Settings saved successfully!');

      // Notify content scripts of preference changes
      await this.notifyContentScripts(newPreferences);

    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showError('Failed to save settings. Please try again.');
    }
  }

  private getEnabledActions(): string[] {
    const actions: string[] = [];
    
    if ((this.formElements.get('actionMap') as HTMLInputElement)?.checked) {
      actions.push('map_it');
    }
    if ((this.formElements.get('actionEmail') as HTMLInputElement)?.checked) {
      actions.push('email');
    }
    if ((this.formElements.get('actionCall') as HTMLInputElement)?.checked) {
      actions.push('call');
    }
    if ((this.formElements.get('actionTrack') as HTMLInputElement)?.checked) {
      actions.push('track_package');
    }
    if ((this.formElements.get('actionConvert') as HTMLInputElement)?.checked) {
      actions.push('convert');
    }

    // Always include copy and search
    actions.push('copy', 'search');
    
    return actions;
  }

  private async resetToDefaults(): Promise<void> {
    try {
      // Reset to default preferences
      this.currentPreferences = DEFAULT_PREFERENCES;
      
      // Save to storage
      await chrome.storage.sync.set({
        [STORAGE_KEYS.USER_PREFERENCES]: DEFAULT_PREFERENCES
      });

      // Apply to form
      this.applyPreferencesToForm();

      // Show success message
      this.showSuccess('Settings reset to defaults!');

      // Notify content scripts
      await this.notifyContentScripts(DEFAULT_PREFERENCES);

    } catch (error) {
      console.error('Failed to reset settings:', error);
      this.showError('Failed to reset settings. Please try again.');
    }
  }

  private async notifyContentScripts(preferences: UserPreferences): Promise<void> {
    try {
      // Send message to all tabs to update preferences
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: 'PREFERENCES_UPDATED',
              preferences
            });
          } catch (error) {
            // Tab might not have content script loaded
            console.log(`Could not notify tab ${tab.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to notify content scripts:', error);
    }
  }

  private showSuccess(message: string): void {
    this.showNotification(message, 'success');
  }

  private showError(message: string): void {
    this.showNotification(message, 'error');
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      background: ${type === 'success' ? '#34a853' : '#ea4335'};
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
}

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  const optionsManager = new OptionsPageManager();
  await optionsManager.initialize();
});
