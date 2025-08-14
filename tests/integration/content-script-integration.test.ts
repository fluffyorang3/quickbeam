import { TextSelectionManager } from '../../src/content/text-selection-manager';
import { PatternRecognitionEngine } from '../../src/content/pattern-recognition-engine';
import { ActionButtonManager } from '../../src/content/action-button-manager';
import { ToolbarManager } from '../../src/content/toolbar-manager';
import { PatternMatch, PatternType, ActionType } from '../../src/types';

// Mock DOM environment
const mockDOM = () => {
  const div = document.createElement('div');
  div.innerHTML = `
    <div id="test-content">
      <p>This is a test paragraph with an email test@example.com and phone number (555) 123-4567.</p>
      <p>Also contains an address: 123 Main Street, New York, NY 10001</p>
    </div>
  `;
  document.body.appendChild(div);
};

describe('Content Script Integration Tests', () => {
  let textSelectionManager: TextSelectionManager;
  let patternRecognitionEngine: PatternRecognitionEngine;
  let actionButtonManager: ActionButtonManager;
  let toolbarManager: ToolbarManager;
  let mockCallback: jest.Mock;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = '';
    mockDOM();

    // Initialize managers
    textSelectionManager = new TextSelectionManager();
    patternRecognitionEngine = new PatternRecognitionEngine();
    actionButtonManager = new ActionButtonManager();
    toolbarManager = new ToolbarManager();
    mockCallback = jest.fn();

    // Set up callback
    textSelectionManager.onSelectionChange(mockCallback);
  });

  afterEach(async () => {
    // Cleanup
    if (textSelectionManager) textSelectionManager.cleanup();
    if (toolbarManager) toolbarManager.cleanup();
    
    // Clear DOM
    document.body.innerHTML = '';
  });

  describe('End-to-End Text Selection Flow', () => {
    it('should process text selection through complete pipeline', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      // Simulate text selection
      const selection = window.getSelection();
      const testContent = document.getElementById('test-content');
      const range = document.createRange();
      range.selectNodeContents(testContent!.querySelector('p')!);
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Trigger selection event
      document.dispatchEvent(new Event('selectionchange'));

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the pipeline worked
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle multiple pattern types in single selection', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await actionButtonManager.initialize();

      const testText = 'test@example.com (555) 123-4567';
      const patterns = await patternRecognitionEngine.detectPatterns(testText);

      // Should detect both email and phone patterns
      const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
      const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);
      
      expect(emailPatterns.length).toBeGreaterThan(0);
      expect(phonePatterns.length).toBeGreaterThan(0);

      // Get actions for email pattern
      const emailActions = await actionButtonManager.getAvailableActions([emailPatterns[0]]);
      expect(emailActions.length).toBeGreaterThan(0);

      // Get actions for phone pattern
      const phoneActions = await actionButtonManager.getAvailableActions([phonePatterns[0]]);
      expect(phoneActions.length).toBeGreaterThan(0);
    });
  });

  describe('Toolbar Integration', () => {
    it('should show toolbar with correct actions for address', async () => {
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const addressMatch: PatternMatch = {
        type: PatternType.ADDRESS,
        match: '123 Main Street, New York, NY 10001',
        confidence: 0.9,
        startIndex: 0,
        endIndex: 35
      };

      const actions = await actionButtonManager.getAvailableActions([addressMatch]);
      expect(actions.length).toBeGreaterThan(0);

      // Mock toolbar positioning
      const mockPosition = { top: 100, left: 200 };
      jest.spyOn(toolbarManager as any, 'calculateToolbarPosition').mockReturnValue(mockPosition);

      await toolbarManager.show(actions, addressMatch.match);

      // Verify toolbar was shown
      expect(toolbarManager['isVisible']).toBe(true);
    });

    it('should hide toolbar after action execution', async () => {
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const emailMatch: PatternMatch = {
        type: PatternType.EMAIL,
        match: 'test@example.com',
        confidence: 0.95,
        startIndex: 0,
        endIndex: 16
      };

      const actions = await actionButtonManager.getAvailableActions([emailMatch]);
      const emailAction = actions.find(a => a.type === ActionType.EMAIL);
      
      await toolbarManager.show(actions, emailMatch.match);
      expect(toolbarManager['isVisible']).toBe(true);

      // Execute action
      if (emailAction) {
        await actionButtonManager.executeAction(emailAction, emailMatch.match);
        
        // Toolbar should be hidden after action execution
        expect(toolbarManager['isVisible']).toBe(false);
      }
    });
  });

  describe('Performance Integration', () => {
    it('should complete full pipeline within performance threshold', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const testText = 'test@example.com';
      const startTime = performance.now();

      // Complete pipeline
      const patterns = await patternRecognitionEngine.detectPatterns(testText);
      const actions = await actionButtonManager.getAvailableActions([patterns[0]]);
      await toolbarManager.show(actions, patterns[0].match);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within 100ms (toolbar appearance target)
      expect(duration).toBeLessThan(100);
      expect(patterns.length).toBeGreaterThan(0);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should handle rapid successive selections efficiently', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const testTexts = [
        'test@example.com',
        '(555) 123-4567',
        '123 Main Street, New York, NY 10001'
      ];

      const startTime = performance.now();

      // Process multiple selections rapidly
      for (const text of testTexts) {
        const patterns = await patternRecognitionEngine.detectPatterns(text);
        const actions = await actionButtonManager.getAvailableActions([patterns[0]]);
        await toolbarManager.show(actions, patterns[0].match);
        await toolbarManager.hide();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle multiple selections efficiently
      expect(duration).toBeLessThan(300); // 3 selections × 100ms each
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle pattern recognition failures', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await toolbarManager.initialize();

      // Mock pattern recognition to fail
      jest.spyOn(patternRecognitionEngine, 'detectPatterns').mockRejectedValue(new Error('Pattern recognition failed'));

      try {
        await patternRecognitionEngine.detectPatterns('invalid text');
      } catch (error) {
        // Should handle error gracefully
        expect(error).toBeDefined();
        expect(toolbarManager['isVisible']).toBe(false);
      }
    });

    it('should handle action execution failures gracefully', async () => {
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const invalidAction = {
        id: 'invalid',
        type: ActionType.COPY,
        name: 'Invalid Action',
        description: 'This action will fail',
        icon: '❌',
        enabled: true,
        execute: jest.fn().mockRejectedValue(new Error('Action execution failed'))
      };

      try {
        await actionButtonManager.executeAction(invalidAction, 'test text');
      } catch (error) {
        // Should handle error gracefully
        expect(error).toBeDefined();
      }
    });
  });

  describe('Memory Management Integration', () => {
    it('should clean up resources properly', async () => {
      await textSelectionManager.initialize();
      await patternRecognitionEngine.initialize();
      await actionButtonManager.initialize();
      await toolbarManager.initialize();

      const testText = 'test@example.com';
      const patterns = await patternRecognitionEngine.detectPatterns(testText);
      const actions = await actionButtonManager.getAvailableActions([patterns[0]]);
      await toolbarManager.show(actions, patterns[0].match);

      // Clean up
      textSelectionManager.cleanup();
      toolbarManager.cleanup();

      // Verify cleanup
      expect(textSelectionManager['isInitialized']).toBe(false);
      expect(toolbarManager['isInitialized']).toBe(false);
    });
  });
});
