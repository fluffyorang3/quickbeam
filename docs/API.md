# QuickBeam Chrome Extension - API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Pattern Recognition](#pattern-recognition)
4. [Action System](#action-system)
5. [Toolbar Management](#toolbar-management)
6. [Performance Monitoring](#performance-monitoring)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Overview

The QuickBeam Chrome Extension provides an intelligent text selection tool that recognizes patterns and provides context-sensitive actions. This document describes the API for developers who want to extend or integrate with the extension.

## Core Components

### TextSelectionManager

Manages text selection detection and provides a debounced callback system.

```typescript
import { TextSelectionManager } from '../content/text-selection-manager';

const manager = new TextSelectionManager();

// Initialize the manager
await manager.initialize();

// Set up selection change callback
manager.onSelectionChange((selectedText: string) => {
  console.log('Text selected:', selectedText);
});

// Clean up when done
manager.cleanup();
```

**Methods:**
- `initialize(): Promise<void>` - Initialize the manager
- `onSelectionChange(callback: (text: string) => void): void` - Set selection callback
- `cleanup(): void` - Clean up resources

### PatternRecognitionEngine

Detects various patterns in text including emails, phone numbers, addresses, and more.

```typescript
import { PatternRecognitionEngine } from '../content/pattern-recognition-engine';

const engine = new PatternRecognitionEngine();

// Initialize the engine
await engine.initialize();

// Detect patterns in text
const patterns = await engine.detectPatterns('Contact us at test@example.com');
console.log('Detected patterns:', patterns);
```

**Methods:**
- `initialize(): Promise<void>` - Initialize the engine
- `detectPatterns(text: string): Promise<PatternMatch[]>` - Detect patterns in text

**Supported Pattern Types:**
- `EMAIL` - Email addresses
- `PHONE` - Phone numbers
- `URL` - Web URLs
- `ADDRESS` - Street addresses
- `TRACKING` - Package tracking numbers
- `DATE_TIME` - Dates and times
- `CURRENCY` - Currency amounts
- `UNIT` - Units of measurement

### ActionButtonManager

Manages quick actions and their execution based on detected patterns.

```typescript
import { ActionButtonManager } from '../content/action-button-manager';

const manager = new ActionButtonManager();

// Initialize the manager
await manager.initialize();

// Get available actions for a pattern
const actions = await manager.getAvailableActions([patternMatch]);

// Execute an action
const result = await manager.executeAction(action, selectedText);
```

**Methods:**
- `initialize(): Promise<void>` - Initialize the manager
- `getAvailableActions(patterns: PatternMatch[]): Promise<QuickAction[]>` - Get actions for patterns
- `executeAction(action: QuickAction, text: string): Promise<ActionExecutionResult>` - Execute an action

## Pattern Recognition

### PatternMatch Interface

```typescript
interface PatternMatch {
  type: PatternType;
  match: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}
```

### Pattern Detection Example

```typescript
const text = 'Contact us at test@example.com or call (555) 123-4567';

const patterns = await patternRecognitionEngine.detectPatterns(text);

// Filter by type
const emailPatterns = patterns.filter(p => p.type === PatternType.EMAIL);
const phonePatterns = patterns.filter(p => p.type === PatternType.PHONE);

console.log('Emails:', emailPatterns.map(p => p.match));
console.log('Phones:', phonePatterns.map(p => p.match));
```

## Action System

### QuickAction Interface

```typescript
interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ActionType;
  enabled: boolean;
  execute: (text: string, context: ActionContext) => Promise<void>;
}
```

### Action Types

- `MAP_IT` - Open address in maps
- `EMAIL` - Compose email
- `CALENDAR` - Add to calendar
- `TRACK_PACKAGE` - Track package
- `CALL` - Make phone call
- `MESSAGE` - Send message
- `CONVERT` - Convert units/currency

### Custom Action Example

```typescript
const customAction: QuickAction = {
  id: 'custom_action',
  name: 'Custom Action',
  description: 'Perform custom operation',
  icon: '🔧',
  type: ActionType.CUSTOM,
  enabled: true,
  execute: async (text: string, context: ActionContext) => {
    // Custom logic here
    console.log('Executing custom action with:', text);
  }
};
```

## Toolbar Management

### ToolbarManager

Manages the floating toolbar that appears when text is selected.

```typescript
import { ToolbarManager } from '../content/toolbar-manager';

const toolbar = new ToolbarManager();

// Initialize the toolbar
await toolbar.initialize();

// Show toolbar with actions
await toolbar.showToolbar(actions, patternMatch);

// Hide toolbar
await toolbar.hideToolbar();

// Check if visible
const isVisible = toolbar.isVisible();
```

**Methods:**
- `initialize(): Promise<void>` - Initialize the toolbar
- `showToolbar(actions: QuickAction[], pattern: PatternMatch): Promise<void>` - Show toolbar
- `hideToolbar(): Promise<void>` - Hide toolbar
- `isVisible(): boolean` - Check if toolbar is visible
- `cleanup(): void` - Clean up resources

## Performance Monitoring

### PerformanceMonitor

Tracks performance metrics and provides optimization recommendations.

```typescript
import { performanceMonitor } from '../utils/performance-monitor';

// Start measuring an operation
const measurementId = performanceMonitor.measureToolbarAppearance();

// Perform the operation
await performOperation();

// End measurement
performanceMonitor.endMeasurement('toolbar-appearance');

// Generate performance report
const report = performanceMonitor.generateReport();
console.log('Performance report:', report);
```

**Key Metrics:**
- Toolbar appearance time (target: <100ms)
- Pattern detection time (target: <50ms)
- Action execution time (target: <200ms)
- Text selection processing (target: <100ms)

**Performance Utilities:**
- `debounce(func, wait)` - Debounce function calls
- `throttle(func, limit)` - Throttle function calls
- `getMemoryUsage()` - Get current memory usage
- `isMemoryUsageHigh()` - Check if memory usage is high

## Error Handling

### Error Handling Patterns

The extension uses systematic error handling with fallback mechanisms:

```typescript
try {
  const result = await performOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  
  // Log error for analysis
  await logError(error, context);
  
  // Execute fallback
  return fallbackOperation();
}
```

### Error Types

- `InitializationError` - Component initialization failures
- `PatternDetectionError` - Pattern recognition failures
- `ActionExecutionError` - Action execution failures
- `ToolbarError` - Toolbar display/hide failures

## Best Practices

### Performance Optimization

1. **Debounce Text Selection**: Use debouncing for text selection events to avoid excessive processing
2. **Lazy Initialization**: Initialize components only when needed
3. **Memory Management**: Clean up event listeners and observers when components are destroyed
4. **Batch Operations**: Group related operations to minimize DOM updates

### Error Handling

1. **Graceful Degradation**: Provide fallback behavior when operations fail
2. **User Feedback**: Inform users when errors occur
3. **Error Logging**: Log errors for debugging and analysis
4. **Recovery Mechanisms**: Implement automatic recovery when possible

### Security

1. **Input Validation**: Validate all user inputs and external data
2. **XSS Prevention**: Sanitize HTML content before insertion
3. **Permission Management**: Request minimal permissions required
4. **Data Privacy**: Process sensitive data locally when possible

### Accessibility

1. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
2. **Screen Reader Support**: Provide proper ARIA labels and descriptions
3. **Focus Management**: Manage focus appropriately during operations
4. **Color Contrast**: Maintain sufficient color contrast for readability

## Integration Examples

### Basic Integration

```typescript
import { TextSelectionManager } from './text-selection-manager';
import { PatternRecognitionEngine } from './pattern-recognition-engine';
import { ActionButtonManager } from './action-button-manager';
import { ToolbarManager } from './toolbar-manager';

class ExtensionManager {
  private textSelection: TextSelectionManager;
  private patternRecognition: PatternRecognitionEngine;
  private actionManager: ActionButtonManager;
  private toolbar: ToolbarManager;

  async initialize() {
    this.textSelection = new TextSelectionManager();
    this.patternRecognition = new PatternRecognitionEngine();
    this.actionManager = new ActionButtonManager();
    this.toolbar = new ToolbarManager();

    await Promise.all([
      this.textSelection.initialize(),
      this.patternRecognition.initialize(),
      this.actionManager.initialize(),
      this.toolbar.initialize()
    ]);

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.textSelection.onSelectionChange(async (selectedText: string) => {
      if (selectedText.trim()) {
        const patterns = await this.patternRecognition.detectPatterns(selectedText);
        if (patterns.length > 0) {
          const actions = await this.actionManager.getAvailableActions([patterns[0]]);
          await this.toolbar.showToolbar(actions, patterns[0]);
        }
      }
    });
  }
}
```

### Performance Monitoring Integration

```typescript
import { performanceMonitor } from './performance-monitor';

class PerformanceAwareManager {
  async performOperation() {
    const measurementId = performanceMonitor.measureToolbarAppearance();
    
    try {
      await this.operation();
    } finally {
      performanceMonitor.endMeasurement('toolbar-appearance');
    }
  }

  generatePerformanceReport() {
    const report = performanceMonitor.generateReport();
    
    if (report.recommendations.length > 0) {
      console.log('Performance recommendations:', report.recommendations);
    }
    
    return report;
  }
}
```

## Troubleshooting

### Common Issues

1. **Toolbar Not Appearing**: Check if text selection events are being captured
2. **Pattern Detection Failing**: Verify text format matches expected patterns
3. **Actions Not Executing**: Check if actions are properly enabled and configured
4. **Performance Issues**: Use performance monitor to identify bottlenecks

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Set debug flag
localStorage.setItem('debug', 'true');

// Check debug status
const isDebug = localStorage.getItem('debug') === 'true';
```

### Performance Profiling

Use the performance monitor to profile operations:

```typescript
// Get detailed metrics
const metrics = performanceMonitor.getMetrics('toolbar-appearance');

// Generate comprehensive report
const report = performanceMonitor.generateReport();
console.log('Performance report:', report);
```

## Support & Contributing

For support, questions, or contributions:

1. Check the [GitHub repository](https://github.com/your-repo/quickbeam)
2. Review [issue tracker](https://github.com/your-repo/quickbeam/issues)
3. Contact the development team

---

*This documentation is part of the QuickBeam Chrome Extension project.*
