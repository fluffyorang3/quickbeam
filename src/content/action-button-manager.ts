import { DEFAULT_PREFERENCES, FEATURE_FLAGS } from '../constants';
import { QuickAction, ActionType, PatternMatch, PatternType, ActionContext } from '../types';

export interface ActionExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class ActionButtonManager {
  private isInitialized = false;
  private availableActions: Map<ActionType, QuickAction> = new Map();
  private actionFactories: Map<ActionType, () => QuickAction> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize action factories
      this.initializeActionFactories();
      
      // Create default actions
      this.createDefaultActions();
      
      this.isInitialized = true;
      console.log('ActionButtonManager initialized');
    } catch (error) {
      console.error('Failed to initialize ActionButtonManager:', error);
      throw error;
    }
  }

  private initializeActionFactories(): void {
    // Map It action
    this.actionFactories.set(ActionType.MAP_IT, () => ({
      id: 'map_it',
      name: 'Map It',
      description: 'Open selected address in Google Maps',
      icon: '🗺️',
      type: ActionType.MAP_IT,
      enabled: true,
      execute: this.executeMapIt.bind(this)
    }));

    // Email action
    this.actionFactories.set(ActionType.EMAIL, () => ({
      id: 'email',
      name: 'Compose Email',
      description: 'Compose email to selected address',
      icon: '✉️',
      type: ActionType.EMAIL,
      enabled: true,
      execute: this.executeEmail.bind(this)
    }));

    // Calendar action
    this.actionFactories.set(ActionType.CALENDAR, () => ({
      id: 'calendar',
      name: 'Add to Calendar',
      description: 'Add event to calendar',
      icon: '📅',
      type: ActionType.CALENDAR,
      enabled: FEATURE_FLAGS.AI_PARSING,
      execute: this.executeCalendar.bind(this)
    }));

    // Track Package action
    this.actionFactories.set(ActionType.TRACK_PACKAGE, () => ({
      id: 'track_package',
      name: 'Track Package',
      description: 'Track package with selected number',
      icon: '📦',
      type: ActionType.TRACK_PACKAGE,
      enabled: true,
      execute: this.executeTrackPackage.bind(this)
    }));

    // Call action
    this.actionFactories.set(ActionType.CALL, () => ({
      id: 'call',
      name: 'Call',
      description: 'Call selected phone number',
      icon: '📞',
      type: ActionType.CALL,
      enabled: true,
      execute: this.executeCall.bind(this)
    }));

    // Message action
    this.actionFactories.set(ActionType.MESSAGE, () => ({
      id: 'message',
      name: 'Message',
      description: 'Send message to selected phone number',
      icon: '💬',
      type: ActionType.MESSAGE,
      enabled: true,
      execute: this.executeMessage.bind(this)
    }));

    // Copy action
    this.actionFactories.set(ActionType.COPY, () => ({
      id: 'copy',
      name: 'Copy',
      description: 'Copy selected text to clipboard',
      icon: '📋',
      type: ActionType.COPY,
      enabled: true,
      execute: this.executeCopy.bind(this)
    }));

    // Search action
    this.actionFactories.set(ActionType.SEARCH, () => ({
      id: 'search',
      name: 'Search',
      description: 'Search for selected text',
      icon: '🔍',
      type: ActionType.SEARCH,
      enabled: true,
      execute: this.executeSearch.bind(this)
    }));

    // Convert action
    this.actionFactories.set(ActionType.CONVERT, () => ({
      id: 'convert',
      name: 'Convert',
      description: 'Convert selected value',
      icon: '🔄',
      type: ActionType.CONVERT,
      enabled: true,
      execute: this.executeConvert.bind(this)
    }));

    // Translate action
    this.actionFactories.set(ActionType.TRANSLATE, () => ({
      id: 'translate',
      name: 'Translate',
      description: 'Translate selected text',
      icon: '🌐',
      type: ActionType.TRANSLATE,
      enabled: true,
      execute: this.executeTranslate.bind(this)
    }));

    // Define action
    this.actionFactories.set(ActionType.DEFINE, () => ({
      id: 'define',
      name: 'Define',
      description: 'Look up definition of selected text',
      icon: '📚',
      type: ActionType.DEFINE,
      enabled: true,
      execute: this.executeDefine.bind(this)
    }));

    // Quick Note action
    this.actionFactories.set(ActionType.QUICK_NOTE, () => ({
      id: 'quick_note',
      name: 'Quick Note',
      description: 'Create a quick note or task',
      icon: '📝',
      type: ActionType.QUICK_NOTE,
      enabled: true,
      execute: this.executeQuickNote.bind(this)
    }));

    // Share action
    this.actionFactories.set(ActionType.SHARE, () => ({
      id: 'share',
      name: 'Share',
      description: 'Share selected text on social media',
      icon: '📤',
      type: ActionType.SHARE,
      enabled: true,
      execute: this.executeShare.bind(this)
    }));
  }

  private createDefaultActions(): void {
    this.actionFactories.forEach((factory, type) => {
      const action = factory();
      this.availableActions.set(type, action);
    });
  }

  getAvailableActions(patterns: PatternMatch[]): QuickAction[] {
    if (!this.isInitialized) return [];

    const actions: QuickAction[] = [];
    
    // Get all available actions and filter by enabled status
    const allActions = Array.from(this.availableActions.values());
    
    // Always include copy and search actions if enabled
    const copyAction = allActions.find(action => action.type === ActionType.COPY);
    const searchAction = allActions.find(action => action.type === ActionType.SEARCH);
    
    if (copyAction && copyAction.enabled) {
      actions.push(copyAction);
    }
    
    if (searchAction && searchAction.enabled) {
      actions.push(searchAction);
    }

    // Add pattern-specific actions if enabled
    patterns.forEach(pattern => {
      const action = this.getActionForPattern(pattern);
      if (action && action.enabled && !actions.some(a => a.id === action.id)) {
        actions.push(action);
      }
    });

    return actions;
  }

  private getActionForPattern(pattern: PatternMatch): QuickAction | null {
    switch (pattern.type) {
      case PatternType.ADDRESS:
        return this.availableActions.get(ActionType.MAP_IT) || null;
      
      case PatternType.EMAIL:
        return this.availableActions.get(ActionType.EMAIL) || null;
      
      case PatternType.PHONE:
        const callAction = this.availableActions.get(ActionType.CALL);
        const messageAction = this.availableActions.get(ActionType.MESSAGE);
        // Return both actions for phone numbers
        return callAction || messageAction || null;
      
      case PatternType.DATE_TIME:
        return this.availableActions.get(ActionType.CALENDAR) || null;
      
      case PatternType.TRACKING_NUMBER:
        return this.availableActions.get(ActionType.TRACK_PACKAGE) || null;
      
      case PatternType.CURRENCY:
      case PatternType.UNIT:
        return this.availableActions.get(ActionType.CONVERT) || null;
      
      default:
        // For any text type, offer quick note and share as general actions
        const quickNoteAction = this.availableActions.get(ActionType.QUICK_NOTE);
        const shareAction = this.availableActions.get(ActionType.SHARE);
        return quickNoteAction || shareAction || null;
    }
  }

  async executeAction(action: QuickAction, selectedText: string): Promise<ActionExecutionResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        message: 'ActionButtonManager not initialized',
        error: 'Not initialized'
      };
    }

    try {
      const context: ActionContext = {
        selectedText,
        pageUrl: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now(),
        userPreferences: DEFAULT_PREFERENCES
      };

      await action.execute(selectedText, context);
      
      return {
        success: true,
        message: `Action ${action.name} executed successfully`,
        data: { actionType: action.type, selectedText }
      };
    } catch (error) {
      console.error(`Error executing action ${action.name}:`, error);
      
      return {
        success: false,
        message: `Failed to execute ${action.name}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async executeMapIt(text: string): Promise<void> {
    const encodedAddress = encodeURIComponent(text);
    const mapsUrl = `https://www.google.com/maps/search/${encodedAddress}`;
    
    // Open in new tab
    window.open(mapsUrl, '_blank');
  }

  private async executeEmail(text: string): Promise<void> {
    // Check if it's an email address
    if (text.includes('@')) {
      const mailtoUrl = `mailto:${text}`;
      window.location.href = mailtoUrl;
    } else {
      // If it's not an email, compose with the text as subject/body
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(text)}`;
      window.location.href = mailtoUrl;
    }
  }

  private async executeCalendar(text: string): Promise<void> {
    try {
      // Parse the text for date/time information
      const eventDetails = this.parseEventDetails(text);
      
      if (eventDetails) {
        // Create Google Calendar event URL
        const calendarUrl = this.createGoogleCalendarUrl(eventDetails);
        window.open(calendarUrl, '_blank');
      } else {
        // Fallback to basic calendar with raw text
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
        window.open(calendarUrl, '_blank');
      }
    } catch (error) {
      console.error('Calendar creation failed:', error);
      // Fallback to basic calendar
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}`;
      window.open(calendarUrl, '_blank');
    }
  }

  private parseEventDetails(text: string): { title: string; date: string; time?: string; location?: string } | null {
    try {
      // Extract date/time patterns
      const dateTimeMatch = text.match(/(?:on\s+)?(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+(?:at\s+)?(\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?)/i);
      const dateMatch = text.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i);
      const timeMatch = text.match(/(\d{1,2}:(?:\d{2})?\s*(?:AM|PM|am|pm)?)/i);
      
      // Extract location
      const locationMatch = text.match(/(?:in|at|room)\s+([A-Za-z\s]+(?:Room|Conference|Building|Office|Floor|Suite|Avenue|Street|Road|Drive|Lane|Court|Place|Way|Terrace|Ter|Close|Crescent|Grove|Hill|Mews|Park|Row|Square|Walk))/i);
      
      // Extract title (everything before date/time/location)
      let title = text;
      if (dateTimeMatch || dateMatch || timeMatch || locationMatch) {
        const firstMatch = [dateTimeMatch, dateMatch, timeMatch, locationMatch].find(match => match);
        if (firstMatch) {
          title = text.substring(0, text.indexOf(firstMatch[0])).trim();
        }
      }
      
      // Clean up title
      title = title.replace(/\b(?:meeting|appointment|call|event|standup|review)\s+/gi, '').trim();
      if (!title) {
        title = 'New Event';
      }
      
      // Format date for Google Calendar
      let date = '';
      if (dateMatch) {
        const dateObj = new Date(dateMatch[0]);
        date = dateObj.toISOString().split('T')[0];
      } else if (dateTimeMatch) {
        // Extract day from text and find next occurrence
        const dayMatch = text.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
        if (dayMatch) {
          const day = dayMatch[0];
          const nextDay = this.getNextDayOfWeek(day);
          date = nextDay.toISOString().split('T')[0];
        }
      }
      
      // Format time
      let time = '';
      if (timeMatch) {
        const timeStr = timeMatch[1];
        time = this.formatTimeForCalendar(timeStr);
      }
      
      // Extract location
      const location = locationMatch ? locationMatch[1].trim() : undefined;
      
      return {
        title,
        date,
        time,
        location
      };
    } catch (error) {
      console.error('Failed to parse event details:', error);
      return null;
    }
  }

  private getNextDayOfWeek(dayName: string): Date {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.findIndex(day => day.toLowerCase() === dayName.toLowerCase());
    
    if (targetDay === -1) return new Date();
    
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + daysUntilTarget);
    
    return nextDay;
  }

  private formatTimeForCalendar(timeStr: string): string {
    // Convert time to 24-hour format for Google Calendar
    const time = timeStr.trim();
    const isPM = /pm/i.test(time);
    const isAM = /am/i.test(time);
    
    let [hours, minutes] = time.replace(/\s*(?:AM|PM|am|pm)/i, '').split(':');
    let hour = parseInt(hours);
    
    if (isPM && hour !== 12) {
      hour += 12;
    } else if (isAM && hour === 12) {
      hour = 0;
    }
    
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinutes = minutes ? minutes.padStart(2, '0') : '00';
    
    return `${formattedHour}:${formattedMinutes}`;
  }

  private createGoogleCalendarUrl(eventDetails: { title: string; date: string; time?: string; location?: string }): string {
    const params = new URLSearchParams();
    params.append('action', 'TEMPLATE');
    params.append('text', eventDetails.title);
    params.append('dates', eventDetails.date);
    
    if (eventDetails.time) {
      // Add time to the date
      const startDateTime = `${eventDetails.date}T${eventDetails.time}:00`;
      const endDateTime = `${eventDetails.date}T${this.addOneHour(eventDetails.time)}:00`;
      params.set('dates', `${startDateTime}/${endDateTime}`);
    }
    
    if (eventDetails.location) {
      params.append('location', eventDetails.location);
    }
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private addOneHour(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    let hour = parseInt(hours);
    hour = (hour + 1) % 24;
    return `${hour.toString().padStart(2, '0')}:${minutes || '00'}`;
  }

  private async executeTrackPackage(text: string): Promise<void> {
    try {
      // Determine carrier and create tracking URL
      const carrier = this.detectCarrier(text);
      const trackingUrl = this.getTrackingUrl(carrier, text);
      
      if (trackingUrl) {
        window.open(trackingUrl, '_blank');
      } else {
        // Fallback to generic search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text + ' tracking')}`;
        window.open(searchUrl, '_blank');
      }
    } catch (error) {
      console.error('Package tracking failed:', error);
      // Fallback to generic search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text + ' tracking')}`;
      window.open(searchUrl, '_blank');
    }
  }

  private async executeCall(text: string): Promise<void> {
    const telUrl = `tel:${text.replace(/\D/g, '')}`;
    window.location.href = telUrl;
  }

  private async executeMessage(text: string): Promise<void> {
    // Try to open default messaging app
    const smsUrl = `sms:${text.replace(/\D/g, '')}`;
    window.location.href = smsUrl;
  }

  private async executeCopy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      
      // Show success feedback (could be enhanced with a toast notification)
      console.log('Text copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private async executeSearch(text: string): Promise<void> {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
    window.open(searchUrl, '_blank');
  }

  private async executeConvert(text: string): Promise<void> {
    try {
      // Parse the text to determine conversion type
      const conversionType = this.detectConversionType(text);
      
      if (conversionType === 'currency') {
        await this.executeCurrencyConversion(text);
      } else if (conversionType === 'unit') {
        await this.executeUnitConversion(text);
      } else {
        // Fallback to search
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text + ' convert')}`;
        window.open(searchUrl, '_blank');
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      // Fallback to search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text + ' convert')}`;
      window.open(searchUrl, '_blank');
    }
  }

  private detectConversionType(text: string): 'currency' | 'unit' | 'unknown' {
    const currencyPattern = /\$|€|£|¥|₹|₽|₩|₪/;
    const unitPattern = /(?:kg|lb|km|mi|°C|°F|L|gal|ft|m|in|cm|mm|yd|oz|g|ton|stone|km\/h|mph|m\/s|knots?|KB|MB|GB|TB|seconds?|minutes?|hours?|days?|weeks?|months?|years?)/i;
    
    if (currencyPattern.test(text)) {
      return 'currency';
    } else if (unitPattern.test(text)) {
      return 'unit';
    }
    
    return 'unknown';
  }

  private async executeCurrencyConversion(text: string): Promise<void> {
    // Extract currency amount and symbol
    const currencyMatch = text.match(/([\$€£¥₹₽₩₪])\s*([\d,]+(?:\.\d{2})?)/);
    if (!currencyMatch) return;
    
    const [_, symbol, amount] = currencyMatch;
    const cleanAmount = amount.replace(/,/g, '');
    
    // Get user's preferred currency from preferences
    const preferredCurrency = DEFAULT_PREFERENCES.actions.preferredCurrency || 'USD';
    
    // Create conversion popup or redirect to currency converter
    const conversionUrl = `https://www.xe.com/currencyconverter/convert/?Amount=${cleanAmount}&From=${this.getCurrencyCode(symbol)}&To=${preferredCurrency}`;
    window.open(conversionUrl, '_blank');
  }

  private async executeUnitConversion(text: string): Promise<void> {
    // Extract unit value and type
    const unitMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|lb|km|mi|°C|°F|L|gal|ft|m|in|cm|mm|yd|oz|g|ton|stone|km\/h|mph|m\/s|knots?|KB|MB|GB|TB|seconds?|minutes?|hours?|days?|weeks?|months?|years?)/i);
    if (!unitMatch) return;
    
    // Mock conversion for now - in production this would use a real conversion API
    const conversionUrl = `https://www.convertunits.com/from/${encodeURIComponent(text)}`;
    window.open(conversionUrl, '_blank');
  }

  private getCurrencyCode(symbol: string): string {
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      '₽': 'RUB',
      '₩': 'KRW',
      '₪': 'ILS'
    };
    
    return currencyMap[symbol] || 'USD';
  }

  private async executeTranslate(text: string): Promise<void> {
    try {
      // Get user's preferred translation target language
      const targetLang = DEFAULT_PREFERENCES.actions.translationTarget || 'en';
      
      // Detect source language automatically
      const sourceLang = 'auto';
      
      // Create translation URL with enhanced options
      const translateUrl = this.createTranslationUrl(text, sourceLang, targetLang);
      window.open(translateUrl, '_blank');
    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to basic Google Translate
      const translateUrl = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`;
      window.open(translateUrl, '_blank');
    }
  }

  private createTranslationUrl(text: string, sourceLang: string, targetLang: string): string {
    // Support multiple translation services
    const translationServices = {
      google: `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodeURIComponent(text)}`,
      deepl: `https://www.deepl.com/translator#${sourceLang}/${targetLang}/${encodeURIComponent(text)}`,
      bing: `https://www.bing.com/translator/?text=${encodeURIComponent(text)}&from=${sourceLang}&to=${targetLang}`,
      yandex: `https://translate.yandex.com/?lang=${sourceLang}-${targetLang}&text=${encodeURIComponent(text)}`
    };
    
    // Use Google Translate as default (most reliable)
    return translationServices.google;
  }

  private async executeDefine(text: string): Promise<void> {
    try {
      // Clean the text for dictionary lookup
      const cleanText = text.trim().toLowerCase();
      
      // Create dictionary lookup URL with multiple service options
      const dictionaryUrl = this.createDictionaryUrl(cleanText);
      window.open(dictionaryUrl, '_blank');
    } catch (error) {
      console.error('Dictionary lookup failed:', error);
      // Fallback to Google search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent('define ' + text)}`;
      window.open(searchUrl, '_blank');
    }
  }

  private createDictionaryUrl(text: string): string {
    // Support multiple dictionary services
    const dictionaryServices = {
      // English dictionaries
      merriam: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(text)}`,
      oxford: `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(text)}`,
      cambridge: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(text)}`,
      collins: `https://www.collinsdictionary.com/dictionary/english/${encodeURIComponent(text)}`,
      
      // Urban Dictionary for slang/colloquial terms
      urban: `https://www.urbandictionary.com/define.php?term=${encodeURIComponent(text)}`,
      
      // Wikipedia for broader definitions
      wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(text)}`,
      
      // Google search as fallback
      google: `https://www.google.com/search?q=${encodeURIComponent('define ' + text)}`
    };
    
    // Use Merriam-Webster as default (comprehensive and reliable)
    return dictionaryServices.merriam;
  }

  private async executeQuickNote(text: string): Promise<void> {
    try {
      // Get user preferences for note-taking platform
      const notePlatform = DEFAULT_PREFERENCES.actions.notePlatform || 'notion';
      
      // Create note URL based on platform preference
      const noteUrl = this.createNoteUrl(text, notePlatform);
      window.open(noteUrl, '_blank');
    } catch (error) {
      console.error('Quick note creation failed:', error);
      // Fallback to Notion
      const noteUrl = `https://www.notion.so/new?name=${encodeURIComponent(text)}`;
      window.open(noteUrl, '_blank');
    }
  }

  private createNoteUrl(text: string, platform: string): string {
    const noteServices: Record<string, string> = {
      // Note-taking platforms
      'notion': `https://www.notion.so/new?name=${encodeURIComponent(text)}`,
      'evernote': `https://www.evernote.com/Home.action#n=${encodeURIComponent(text)}`,
      'onenote': `https://www.onenote.com/notebooks?auth=1&login=1`,
      'google-keep': `https://keep.google.com/new?text=${encodeURIComponent(text)}`,
      
      // Task management platforms
      'todoist': `https://todoist.com/app#task/add?content=${encodeURIComponent(text)}`,
      'trello': `https://trello.com/b/board/new?name=${encodeURIComponent(text)}`,
      'asana': `https://app.asana.com/0/create-task?name=${encodeURIComponent(text)}`,
      
      // Document platforms
      'google-docs': `https://docs.google.com/document/create?title=${encodeURIComponent(text)}`,
      'dropbox-paper': `https://paper.dropbox.com/doc/new?title=${encodeURIComponent(text)}`,
      
      // Fallback to Notion
      'default': `https://www.notion.so/new?name=${encodeURIComponent(text)}`
    };
    
    return noteServices[platform] || noteServices['default'];
  }

  private async executeShare(text: string): Promise<void> {
    try {
      // Get user preferences for sharing platform
      const sharePlatform = DEFAULT_PREFERENCES.actions.sharePlatform || 'twitter';
      
      // Create share URL based on platform preference
      const shareUrl = this.createShareUrl(text, sharePlatform);
      window.open(shareUrl, '_blank');
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to Twitter
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(shareUrl, '_blank');
    }
  }

  private createShareUrl(text: string, platform: string): string {
    const shareServices: Record<string, string> = {
      // Social media platforms
      'twitter': `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      'facebook': `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
      'linkedin': `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(document.title)}&summary=${encodeURIComponent(text)}&source=${encodeURIComponent(window.location.href)}`,
      'whatsapp': `https://wa.me/?text=${encodeURIComponent(text)}`,
      'reddit': `https://www.reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(document.title)}`,
      'pinterest': `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(window.location.href)}&description=${encodeURIComponent(text)}`,
      'tumblr': `https://www.tumblr.com/share/link?url=${encodeURIComponent(window.location.href)}&name=${encodeURIComponent(document.title)}&description=${encodeURIComponent(text)}`,
      'email': `mailto:?subject=${encodeURIComponent(document.title)}&body=${encodeURIComponent(text)}`,
      
      // Fallback to Twitter
      'default': `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    };
    
    return shareServices[platform] || shareServices['default'];
  }

  private detectCarrier(trackingNumber: string): string {
    // Enhanced carrier detection with international support
    const cleanNumber = trackingNumber.replace(/\s+/g, '').toUpperCase();
    
    // UPS patterns
    if (/^1Z[0-9A-Z]{16}$/.test(cleanNumber)) return 'ups';
    if (/^T[0-9]{10}$/.test(cleanNumber)) return 'ups';
    if (/^[0-9]{9}$/.test(cleanNumber)) return 'ups';
    
    // FedEx patterns
    if (/^[0-9]{12}$/.test(cleanNumber)) return 'fedex';
    if (/^[0-9]{15}$/.test(cleanNumber)) return 'fedex';
    if (/^[0-9]{22}$/.test(cleanNumber)) return 'fedex';
    if (/^[0-9]{9}$/.test(cleanNumber)) return 'fedex';
    
    // USPS patterns
    if (/^[0-9]{20}$/.test(cleanNumber)) return 'usps';
    if (/^[0-9]{22}$/.test(cleanNumber)) return 'usps';
    if (/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(cleanNumber)) return 'usps';
    if (/^[0-9]{16}$/.test(cleanNumber)) return 'usps';
    
    // DHL patterns
    if (/^[0-9]{10}$/.test(cleanNumber)) return 'dhl';
    if (/^[0-9]{12}$/.test(cleanNumber)) return 'dhl';
    if (/^[0-9]{14}$/.test(cleanNumber)) return 'dhl';
    if (/^[0-9]{16}$/.test(cleanNumber)) return 'dhl';
    
    // International carriers
    if (/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(cleanNumber)) {
      // Check for specific country codes
      if (/^GB[0-9]{9}GB$/.test(cleanNumber)) return 'royal-mail';
      if (/^CA[0-9]{9}CA$/.test(cleanNumber)) return 'canada-post';
      if (/^AU[0-9]{9}AU$/.test(cleanNumber)) return 'australia-post';
      if (/^DE[0-9]{9}DE$/.test(cleanNumber)) return 'deutsche-post';
      if (/^FR[0-9]{9}FR$/.test(cleanNumber)) return 'la-poste';
      if (/^ES[0-9]{9}ES$/.test(cleanNumber)) return 'correos';
      if (/^NL[0-9]{9}NL$/.test(cleanNumber)) return 'postnl';
      if (/^CH[0-9]{9}CH$/.test(cleanNumber)) return 'swiss-post';
      
      // Default to Royal Mail for UK format
      return 'royal-mail';
    }
    
    // E-commerce platforms
    if (/^TBA[0-9]{10}$/.test(cleanNumber)) return 'amazon';
    if (/^[0-9]{12}$/.test(cleanNumber) && cleanNumber.length === 12) return 'ebay';
    if (/^[0-9]{13}$/.test(cleanNumber) || /^[0-9]{15}$/.test(cleanNumber) || /^[0-9]{17}$/.test(cleanNumber)) return 'aliexpress';
    
    // Generic patterns for unknown carriers
    if (/^[0-9A-Z]{10,25}$/.test(cleanNumber)) return 'generic';
    
    return 'unknown';
  }

  private getTrackingUrl(carrier: string, trackingNumber: string): string | null {
    const cleanNumber = trackingNumber.replace(/\s+/g, '');
    
    const trackingUrls: Record<string, string> = {
      // US Carriers
      'ups': `https://www.ups.com/track?tracknum=${cleanNumber}`,
      'fedex': `https://www.fedex.com/fedextrack/?trknbr=${cleanNumber}`,
      'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${cleanNumber}`,
      'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${cleanNumber}`,
      
      // International Carriers
      'royal-mail': `https://www.royalmail.com/track-your-item#/tracking-results/${cleanNumber}`,
      'canada-post': `https://www.canadapost-postescanada.ca/track-reperage/en#/searchDetails?searchFor=track&searchType=tracking&searchValue=${cleanNumber}`,
      'australia-post': `https://auspost.com.au/mypost/track/#/search?q=${cleanNumber}`,
      'deutsche-post': `https://www.deutschepost.de/sendung/simpleQuery.html?lang=de_DE&formattedParcelCodes=${cleanNumber}`,
      'la-poste': `https://www.laposte.fr/outils/suivre-vos-envois?code=${cleanNumber}`,
      'correos': `https://www.correos.es/es/web/correos/envios?numero=${cleanNumber}`,
      'postnl': `https://www.postnl.nl/tracktrace/?B=${cleanNumber}&P=${cleanNumber}`,
      'swiss-post': `https://www.post.ch/en/track?formattedParcelCodes=${cleanNumber}`,
      
      // E-commerce platforms
      'amazon': `https://www.amazon.com/gp/help/customer/display.html?nodeId=GXGM9ZXV8J5QX4T4`,
      'ebay': `https://www.ebay.com/sh/lst/active`,
      'aliexpress': `https://global.cainiao.com/global/detail.html?mailNo=${cleanNumber}`,
      
      // Generic fallback
      'generic': `https://www.google.com/search?q=${encodeURIComponent(cleanNumber + ' tracking')}`,
      'unknown': `https://www.google.com/search?q=${encodeURIComponent(cleanNumber + ' tracking')}`
    };
    
    return trackingUrls[carrier] || trackingUrls['unknown'];
  }

  updateActionAvailability(actionType: ActionType, enabled: boolean): void {
    const action = this.availableActions.get(actionType);
    if (action) {
      action.enabled = enabled;
    }
  }

  getAction(actionType: ActionType): QuickAction | null {
    return this.availableActions.get(actionType) || null;
  }

  getAllActions(): QuickAction[] {
    return Array.from(this.availableActions.values());
  }

  updateActionAvailabilityFromPreferences(actionPreferences: any): void {
    // Update action availability based on user preferences
    const enabledActions = actionPreferences.enabledActions || [];
    
    this.availableActions.forEach((action) => {
      // Check if action is in the enabled actions list
      const isEnabled = enabledActions.includes(action.id);
      action.enabled = isEnabled;
    });
    
    console.log('Action availability updated based on preferences');
  }

  cleanup(): void {
    this.availableActions.clear();
    this.actionFactories.clear();
    this.isInitialized = false;
  }
}
