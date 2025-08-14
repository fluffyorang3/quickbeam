import { TextSelectionManager } from '../../src/content/text-selection-manager';

describe('TextSelectionManager', () => {
  let manager: TextSelectionManager;
  let mockCallback: jest.Mock;

  beforeEach(() => {
    manager = new TextSelectionManager();
    mockCallback = jest.fn();
    
    // Mock document methods
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
    
    // Mock window.getSelection
    Object.defineProperty(window, 'getSelection', {
      writable: true,
      value: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
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

    it('should set up event listeners on initialization', async () => {
      await manager.initialize();
      
      expect(document.addEventListener).toHaveBeenCalledWith(
        'selectionchange',
        expect.any(Function)
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        'keyup',
        expect.any(Function)
      );
      expect(document.addEventListener).toHaveBeenCalledWith(
        'touchend',
        expect.any(Function)
      );
    });

    it('should set up mutation observer on initialization', async () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
      
      jest.spyOn(window, 'MutationObserver').mockImplementation(() => mockObserver as any);
      
      await manager.initialize();
      
      expect(mockObserver.observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  });

  describe('text selection handling', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should call callback when text is selected', async () => {
      await manager.initialize();
      
      // Simulate text selection
      const testElement = document.createElement('div');
      testElement.textContent = 'selected text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger selection change
      document.dispatchEvent(new Event('selectionchange'));
      
      // Wait for debouncing
      jest.advanceTimersByTime(60);
      
      expect(mockCallback).toHaveBeenCalledWith('selected text');
    });

    it('should debounce selection changes', async () => {
      await manager.initialize();
      
      // Simulate multiple rapid selection changes
      const testElement = document.createElement('div');
      testElement.textContent = 'test text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger multiple selection changes rapidly
      document.dispatchEvent(new Event('selectionchange'));
      document.dispatchEvent(new Event('selectionchange'));
      document.dispatchEvent(new Event('selectionchange'));
      
      // Wait for debouncing
      jest.advanceTimersByTime(60);
      
      // Callback should be called only once due to debouncing
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle mouse up events', async () => {
      await manager.initialize();
      
      // Simulate text selection via mouse
      const testElement = document.createElement('div');
      testElement.textContent = 'mouse selected text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger mouse up event
      document.dispatchEvent(new MouseEvent('mouseup'));
      
      // Wait for processing
      jest.advanceTimersByTime(20);
      
      expect(mockCallback).toHaveBeenCalledWith('mouse selected text');
    });

    it('should handle keyboard selection events', async () => {
      await manager.initialize();
      
      // Simulate text selection via keyboard
      const testElement = document.createElement('div');
      testElement.textContent = 'keyboard selected text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger key up event with shift key
      const keyEvent = new KeyboardEvent('keyup', { shiftKey: true });
      document.dispatchEvent(keyEvent);
      
      // Wait for processing
      jest.advanceTimersByTime(20);
      
      expect(mockCallback).toHaveBeenCalledWith('keyboard selected text');
    });

    it('should handle touch events', async () => {
      await manager.initialize();
      
      // Simulate text selection via touch
      const testElement = document.createElement('div');
      testElement.textContent = 'touch selected text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger touch end event
      document.dispatchEvent(new TouchEvent('touchend'));
      
      // Wait for processing
      jest.advanceTimersByTime(110);
      
      expect(mockCallback).toHaveBeenCalledWith('touch selected text');
    });

    it('should not call callback for empty selections', () => {
      const mockSelection = {
        toString: () => '',
        rangeCount: 0
      };
      
      (window.getSelection as jest.Mock).mockReturnValue(mockSelection);
      
      manager.onSelectionChange(mockCallback);
      
      const selectionChangeEvent = new Event('selectionchange');
      document.dispatchEvent(selectionChangeEvent);
      
      jest.advanceTimersByTime(60);
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not call callback for unchanged selections', async () => {
      await manager.initialize();
      
      // Simulate initial text selection
      const testElement = document.createElement('div');
      testElement.textContent = 'same text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger selection change
      document.dispatchEvent(new Event('selectionchange'));
      jest.advanceTimersByTime(60);
      
      expect(mockCallback).toHaveBeenCalledWith('same text');
      mockCallback.mockClear();
      
      // Same selection again
      document.dispatchEvent(new Event('selectionchange'));
      jest.advanceTimersByTime(60);
      
      // Should not call callback for unchanged selection
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('mutation observer handling', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should validate selection after DOM changes', async () => {
      await manager.initialize();
      
      // Simulate text selection
      const testElement = document.createElement('div');
      testElement.textContent = 'test text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger selection change
      document.dispatchEvent(new Event('selectionchange'));
      jest.advanceTimersByTime(60);
      
      expect(mockCallback).toHaveBeenCalledWith('test text');
      mockCallback.mockClear();
      
      // Simulate DOM mutation by removing the element
      document.body.removeChild(testElement);
      
      // Should trigger selection validation
      expect(mockCallback).toHaveBeenCalledWith('');
    });
  });

  describe('cleanup', () => {
    it('should clean up event listeners and observer', () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      };
      
      jest.spyOn(window, 'MutationObserver').mockImplementation(() => mockObserver as any);
      
      manager.initialize();
      manager.cleanup();
      
      expect(document.removeEventListener).toHaveBeenCalled();
      expect(mockObserver.disconnect).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors gracefully', async () => {
      const mockManager = new TextSelectionManager();
      jest.spyOn(mockManager as any, 'setupSelectionListeners').mockImplementation(() => {
        throw new Error('Event listener setup failed');
      });

      await expect(mockManager.initialize()).rejects.toThrow('Event listener setup failed');
    });

    it('should handle selection processing errors gracefully', async () => {
      await manager.initialize();
      
      // Mock getSelection to throw error
      (window.getSelection as jest.Mock).mockImplementation(() => {
        throw new Error('Selection error');
      });
      
      manager.onSelectionChange(mockCallback);
      
      // Should not crash on selection change
      const selectionChangeEvent = new Event('selectionchange');
      expect(() => {
        document.dispatchEvent(selectionChangeEvent);
        jest.advanceTimersByTime(60);
      }).not.toThrow();
    });
  });

  describe('performance', () => {
    beforeEach(async () => {
      jest.useFakeTimers();
      await manager.initialize();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should complete selection processing within performance threshold', async () => {
      await manager.initialize();
      
      const startTime = performance.now();
      
      // Simulate text selection
      const testElement = document.createElement('div');
      testElement.textContent = 'performance test text';
      document.body.appendChild(testElement);
      
      const range = document.createRange();
      range.selectNodeContents(testElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      
      // Trigger selection change
      document.dispatchEvent(new Event('selectionchange'));
      
      // Wait for processing
      jest.advanceTimersByTime(60);
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(mockCallback).toHaveBeenCalledWith('performance test text');
    });
  });
});
