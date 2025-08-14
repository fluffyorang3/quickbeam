import { ActionButtonManager } from '../../src/content/action-button-manager';
import { ActionType, PatternType } from '../../src/types';

describe('Extended Quick Actions - Execution Cycle 6', () => {
  let actionManager: ActionButtonManager;

  beforeEach(async () => {
    actionManager = new ActionButtonManager();
    await actionManager.initialize();
  });

  afterEach(() => {
    actionManager.cleanup();
  });

  describe('Currency and Unit Conversion', () => {
    test('should detect currency patterns correctly', async () => {
      const action = actionManager.getAction(ActionType.CONVERT);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should handle currency conversion for USD', async () => {
      const action = actionManager.getAction(ActionType.CONVERT);
      expect(action).toBeDefined();
      
      // Mock window.open
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('$150');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('xe.com/currencyconverter'),
        '_blank'
      );
    });

    test('should handle unit conversion for weight', async () => {
      const action = actionManager.getAction(ActionType.CONVERT);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('25 kg');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('convertunits.com'),
        '_blank'
      );
    });
  });

  describe('Calendar Event Creation', () => {
    test('should detect calendar action for date/time patterns', async () => {
      const action = actionManager.getAction(ActionType.CALENDAR);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should parse event details with day and time', async () => {
      const action = actionManager.getAction(ActionType.CALENDAR);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('Team meeting Monday at 3 PM');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('calendar.google.com'),
        '_blank'
      );
    });

    test('should parse event details with specific date', async () => {
      const action = actionManager.getAction(ActionType.CALENDAR);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('Appointment Dec 15, 2024 at 2:30 PM');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('calendar.google.com'),
        '_blank'
      );
    });
  });

  describe('Enhanced Package Tracking', () => {
    test('should detect tracking action for tracking numbers', async () => {
      const action = actionManager.getAction(ActionType.TRACK_PACKAGE);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should handle UPS tracking numbers', async () => {
      const action = actionManager.getAction(ActionType.TRACK_PACKAGE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('1Z999AA1234567890');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('ups.com/track'),
        '_blank'
      );
    });

    test('should handle international tracking numbers', async () => {
      const action = actionManager.getAction(ActionType.TRACK_PACKAGE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('GB123456789GB');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('royalmail.com'),
        '_blank'
      );
    });
  });

  describe('Enhanced Translation', () => {
    test('should detect translation action', async () => {
      const action = actionManager.getAction(ActionType.TRANSLATE);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should create translation URL with user preferences', async () => {
      const action = actionManager.getAction(ActionType.TRANSLATE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('Hello world');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('translate.google.com'),
        '_blank'
      );
    });
  });

  describe('Enhanced Dictionary Lookup', () => {
    test('should detect dictionary action', async () => {
      const action = actionManager.getAction(ActionType.DEFINE);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should create dictionary URL with Merriam-Webster', async () => {
      const action = actionManager.getAction(ActionType.DEFINE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('serendipity');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('merriam-webster.com'),
        '_blank'
      );
    });
  });

  describe('Quick Note Creation', () => {
    test('should detect quick note action', async () => {
      const action = actionManager.getAction(ActionType.QUICK_NOTE);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should create note URL with Notion by default', async () => {
      const action = actionManager.getAction(ActionType.QUICK_NOTE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('Important meeting notes');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('notion.so/new'),
        '_blank'
      );
    });
  });

  describe('Social Media Sharing', () => {
    test('should detect share action', async () => {
      const action = actionManager.getAction(ActionType.SHARE);
      expect(action).toBeDefined();
      expect(action?.enabled).toBe(true);
    });

    test('should create share URL with Twitter by default', async () => {
      const action = actionManager.getAction(ActionType.SHARE);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      await action?.execute('Check out this amazing article!');
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank'
      );
    });
  });

  describe('Action Availability', () => {
    test('should provide appropriate actions for different pattern types', () => {
      const addressPattern = { type: PatternType.ADDRESS, match: '123 Main St', confidence: 0.9, startIndex: 0, endIndex: 12 };
      const actions = actionManager.getAvailableActions([addressPattern]);
      
      expect(actions.some(action => action.type === ActionType.MAP_IT)).toBe(true);
    });

    test('should provide general actions for any text type', () => {
      const genericPattern = { type: PatternType.URL, match: 'https://example.com', confidence: 0.8, startIndex: 0, endIndex: 19 };
      const actions = actionManager.getAvailableActions([genericPattern]);
      
      // Should include copy and search actions
      expect(actions.some(action => action.type === ActionType.COPY)).toBe(true);
      expect(actions.some(action => action.type === ActionType.SEARCH)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle conversion errors gracefully', async () => {
      const action = actionManager.getAction(ActionType.CONVERT);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      // Test with invalid text
      await action?.execute('');
      
      // Should fallback to Google search
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('google.com/search'),
        '_blank'
      );
    });

    test('should handle calendar creation errors gracefully', async () => {
      const action = actionManager.getAction(ActionType.CALENDAR);
      expect(action).toBeDefined();
      
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true
      });

      // Test with invalid text
      await action?.execute('');
      
      // Should fallback to basic calendar
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('calendar.google.com'),
        '_blank'
      );
    });
  });
});
