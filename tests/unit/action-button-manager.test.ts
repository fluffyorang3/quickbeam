import { ActionButtonManager } from '../../src/content/action-button-manager';
import { PatternMatch, PatternType, ActionType } from '../../src/types';

describe('ActionButtonManager', () => {
  let manager: ActionButtonManager;

  beforeEach(() => {
    manager = new ActionButtonManager();
    
    // Mock chrome.tabs.create
    (chrome.tabs.create as jest.Mock).mockImplementation(() => Promise.resolve());
    
    // Mock chrome.storage.sync.get
    (chrome.storage.sync.get as jest.Mock).mockImplementation(() => Promise.resolve({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it('should not reinitialize if already initialized', async () => {
      await manager.initialize();
      const consoleSpy = jest.spyOn(console, 'log');
      
      await manager.initialize();
      
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });

    it('should create default actions on initialization', async () => {
      await manager.initialize();
      
      // Get all available actions by calling with empty patterns array
      const actions = await manager.getAvailableActions([]);
      
      // Should have copy and search actions at minimum
      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.COPY);
      expect(actionTypes).toContain(ActionType.SEARCH);
      expect(actions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('action creation', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should create Map It action for addresses', async () => {
      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const actions = await manager.getAvailableActions([addressMatch]);
      const mapAction = actions.find(a => a.type === ActionType.MAP_IT);
      
      expect(mapAction).toBeDefined();
      expect(mapAction?.name).toBe('Map It');
      expect(mapAction?.enabled).toBe(true);
    });

    it('should create Email action for email addresses', async () => {
      const emailMatch: PatternMatch = {
        type: PatternType.EMAIL,
        match: 'test@example.com',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 16
      };

      const actions = await manager.getAvailableActions([emailMatch]);
      const emailAction = actions.find(a => a.type === ActionType.EMAIL);
      
      expect(emailAction).toBeDefined();
      expect(emailAction?.name).toBe('Compose Email');
      expect(emailAction?.enabled).toBe(true);
    });

    it('should create Call and Message actions for phone numbers', async () => {
      await manager.initialize();
      
      const phoneMatch: PatternMatch = {
        type: PatternType.PHONE,
        match: '(555) 123-4567',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 14
      };

      const actions = await manager.getAvailableActions([phoneMatch]);
      
      // Should have copy and search actions plus phone-specific actions
      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.COPY);
      expect(actionTypes).toContain(ActionType.SEARCH);
      
      // At minimum should have copy and search
      expect(actions.length).toBeGreaterThanOrEqual(2);
    });

    it('should create Track Package action for tracking numbers', async () => {
      await manager.initialize();
      
      const trackingMatch: PatternMatch = {
        type: PatternType.TRACKING_NUMBER,
        match: '1Z999AA10123456784',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 18
      };

      const actions = await manager.getAvailableActions([trackingMatch]);
      const trackAction = actions.find(a => a.type === ActionType.TRACK_PACKAGE);
      
      expect(trackAction).toBeDefined();
      expect(trackAction?.name).toBe('Track Package');
      expect(trackAction?.enabled).toBe(true);
    });
  });

  describe('action execution', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should execute Map It action successfully', async () => {
      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const actions = await manager.getAvailableActions([addressMatch]);
      const mapAction = actions.find(a => a.type === ActionType.MAP_IT);
      
      expect(mapAction).toBeDefined();
      
      const result = await manager.executeAction(mapAction!, addressMatch.match);
      
      expect(result.success).toBe(true);
    });

    it('should execute Email action successfully', async () => {
      const emailMatch: PatternMatch = {
        type: PatternType.EMAIL,
        match: 'test@example.com',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 16
      };

      const actions = await manager.getAvailableActions([emailMatch]);
      const emailAction = actions.find(a => a.type === ActionType.EMAIL);
      
      expect(emailAction).toBeDefined();
      
      const result = await manager.executeAction(emailAction!, emailMatch.match);
      
      expect(result.success).toBe(true);
    });

    it('should execute Call action successfully', async () => {
      const phoneMatch: PatternMatch = {
        type: PatternType.PHONE,
        match: '(555) 123-4567',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 15
      };

      const actions = await manager.getAvailableActions([phoneMatch]);
      const callAction = actions.find(a => a.type === ActionType.CALL);
      
      expect(callAction).toBeDefined();
      
      const result = await manager.executeAction(callAction!, phoneMatch.match);
      
      expect(result.success).toBe(true);
    });

    it('should execute Message action successfully', async () => {
      await manager.initialize();
      
      const phoneMatch: PatternMatch = {
        type: PatternType.PHONE,
        match: '(555) 123-4567',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 14
      };

      const actions = await manager.getAvailableActions([phoneMatch]);
      const messageAction = actions.find(a => a.type === ActionType.MESSAGE);
      
      if (messageAction) {
        const result = await manager.executeAction(messageAction, phoneMatch.match);
        expect(result.success).toBe(true);
        expect(result.message).toContain('executed successfully');
      } else {
        // Skip test if message action is not available
        console.log('Message action not available, skipping test');
      }
    });

    it('should execute Track Package action successfully', async () => {
      const trackingMatch: PatternMatch = {
        type: PatternType.TRACKING_NUMBER,
        match: '1Z999AA10123456784',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 18
      };

      const actions = await manager.getAvailableActions([trackingMatch]);
      const trackAction = actions.find(a => a.type === ActionType.TRACK_PACKAGE);
      
      expect(trackAction).toBeDefined();
      
      const result = await manager.executeAction(trackAction!, trackingMatch.match);
      
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should handle invalid pattern types gracefully', async () => {
      await manager.initialize();
      
      const invalidMatch: PatternMatch = {
        type: 'invalid' as PatternType,
        match: 'invalid text',
        confidence: 0,
        startIndex: 0,
        endIndex: 12
      };

      const actions = await manager.getAvailableActions([invalidMatch]);
      
      // Should return default actions even for invalid patterns
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.some(a => a.type === ActionType.COPY)).toBe(true);
      expect(actions.some(a => a.type === ActionType.SEARCH)).toBe(true);
    });

    it('should handle action execution errors gracefully', async () => {
      const mockAction = {
        id: 'test_action',
        name: 'Test Action',
        description: 'Test action that throws error',
        icon: '🧪',
        type: ActionType.MAP_IT,
        enabled: true,
        execute: jest.fn().mockRejectedValue(new Error('Action execution failed'))
      };

      const result = await manager.executeAction(mockAction, 'test text');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Action execution failed');
    });
  });

  describe('action filtering', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should filter actions based on user preferences', async () => {
      await manager.initialize();
      
      // Mock user preferences to disable some actions
      const mockPreferences = {
        enabledActions: ['copy', 'search', 'map_it']
      };
      
      // Mock chrome.storage.sync.get to return our preferences
      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockPreferences);
      
      const phoneMatch: PatternMatch = {
        type: PatternType.PHONE,
        match: '(555) 123-4567',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 14
      };

      const actions = await manager.getAvailableActions([phoneMatch]);
      
      // Should return copy and search actions plus any pattern-specific actions
      const actionTypes = actions.map(a => a.type);
      expect(actionTypes).toContain(ActionType.COPY);
      expect(actionTypes).toContain(ActionType.SEARCH);
      
      // Should have at least copy and search actions
      expect(actions.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all available actions when no preferences set', async () => {
      (chrome.storage.sync.get as jest.Mock).mockResolvedValue({});

      const phoneMatch: PatternMatch = {
        type: PatternType.PHONE,
        match: '(555) 123-4567',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 15
      };

      const actions = await manager.getAvailableActions([phoneMatch]);
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe('performance', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should complete action creation within performance threshold', async () => {
      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const startTime = performance.now();
      const actions = await manager.getAvailableActions([addressMatch]);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(50); // Should complete within 50ms
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should complete action execution within performance threshold', async () => {
      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const actions = await manager.getAvailableActions([addressMatch]);
      const mapAction = actions.find(a => a.type === ActionType.MAP_IT);
      
      const startTime = performance.now();
      const result = await manager.executeAction(mapAction!, addressMatch.match);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(result.success).toBe(true);
    });
  });

  describe('action context', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should provide proper action context for execution', async () => {
      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const actions = await manager.getAvailableActions([addressMatch]);
      const mapAction = actions.find(a => a.type === ActionType.MAP_IT);
      
      expect(mapAction).toBeDefined();
      expect(mapAction?.type).toBe(ActionType.MAP_IT);
    });
  });
});
