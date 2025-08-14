# Universal Quick Actions Chrome Extension - AI Agent Execution Protocols

## Table of Contents
1. [Computational Standards](#computational-standards)
2. [Chrome Extension Algorithmic Patterns](#chrome-extension-algorithmic-patterns)
3. [Code Architecture & Optimization](#code-architecture--optimization)
4. [Systematic Testing Protocols](#systematic-testing-protocols)
5. [Security & Privacy Algorithms](#security--privacy-algorithms)
6. [Performance Optimization Algorithms](#performance-optimization-algorithms)
7. [User Experience Optimization](#user-experience-optimization)
8. [Deployment & Distribution Automation](#deployment--distribution-automation)
9. [Maintenance & Update Protocols](#maintenance--update-protocols)
10. [Collaboration & Version Control](#collaboration--version-control)

---

## Computational Standards

### Technology Stack Selection
- **Language**: TypeScript (type safety, compile-time error detection)
- **Build Tool**: Vite (faster compilation, better tree shaking)
- **Package Manager**: npm (largest ecosystem, better dependency resolution)
- **Version Control**: Git with conventional commit automation
- **Code Quality**: ESLint + Prettier + Husky (automated enforcement)

### Project Structure Algorithm
```
quick-beam/
├── src/
│   ├── background/          # Service worker (persistent state management)
│   ├── content/             # Content scripts (DOM interaction)
│   ├── popup/               # Extension popup (user interface)
│   ├── options/             # Options page (configuration)
│   ├── components/          # Reusable UI components (modular design)
│   ├── utils/               # Utility functions (pure functions)
│   ├── types/               # TypeScript interfaces (contract enforcement)
│   └── constants/           # Application constants (centralized configuration)
├── dist/                    # Built extension (production artifacts)
├── assets/                  # Static resources (icons, images)
├── tests/                   # Test suites (automated validation)
├── docs/                    # Documentation (knowledge base)
├── package.json             # Dependencies and scripts
├── manifest.json            # Extension configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Build configuration
└── README.md                # Project overview
```

### Code Generation Standards
- **Naming Convention**: camelCase (variables/functions), PascalCase (classes), UPPER_SNAKE_CASE (constants)
- **Documentation**: JSDoc for public APIs, inline comments for complex algorithms
- **Error Handling**: Systematic error handling with fallback mechanisms
- **Async Operations**: Async/await for better error handling and readability
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures

---

## Chrome Extension Algorithmic Patterns

### Manifest V3 Compliance Algorithm
```typescript
// Manifest V3 compliance checklist
const manifestV3Requirements = {
  manifest_version: 3,
  background: { service_worker: "background.js" },
  content_scripts: [{ run_at: "document_end" }],
  permissions: ["storage", "activeTab"], // Minimal permissions
  host_permissions: ["<all_urls>"], // Required for content scripts
  content_security_policy: "script-src 'self'; object-src 'self'"
};
```

### Content Script Optimization Algorithm
```typescript
// Content script performance optimization
class ContentScriptManager {
  private eventListeners: Map<string, EventListener> = new Map();
  
  inject() {
    // Use MutationObserver for dynamic content
    const observer = new MutationObserver(this.handleDOMChanges.bind(this));
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Debounce text selection events
    this.debounceTextSelection();
  }
  
  private debounceTextSelection() {
    let timeout: NodeJS.Timeout;
    document.addEventListener('selectionchange', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.handleTextSelection(), 100);
    });
  }
  
  cleanup() {
    // Proper cleanup to prevent memory leaks
    this.eventListeners.forEach((listener, event) => {
      document.removeEventListener(event, listener);
    });
  }
}
```

### Background Script Persistence Algorithm
```typescript
// Service worker persistence strategy
class ServiceWorkerManager {
  private keepAliveInterval: NodeJS.Timeout;
  
  startKeepAlive() {
    // Keep service worker alive with periodic tasks
    this.keepAliveInterval = setInterval(() => {
      this.performPeriodicTask();
    }, 25000); // 25 seconds (Chrome kills after 30s of inactivity)
  }
  
  private async performPeriodicTask() {
    try {
      // Update storage, check for updates, etc.
      await this.updateStorage();
    } catch (error) {
      console.error('Periodic task failed:', error);
    }
  }
}
```

### Security Implementation Algorithm
```typescript
// Security validation system
class SecurityValidator {
  static validateInput(input: string): boolean {
    // Prevent XSS attacks
    const dangerousPatterns = /<script|javascript:|data:text\/html/i;
    return !dangerousPatterns.test(input);
  }
  
  static sanitizeHTML(html: string): string {
    // Use DOMPurify or similar for HTML sanitization
    return DOMPurify.sanitize(html);
  }
  
  static validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }
}
```

---

## Code Architecture & Optimization

### Design Pattern Implementation
```typescript
// Observer pattern for text selection events
class TextSelectionObserver {
  private observers: Set<(selection: string) => void> = new Set();
  
  subscribe(callback: (selection: string) => void) {
    this.observers.add(callback);
  }
  
  unsubscribe(callback: (selection: string) => void) {
    this.observers.delete(callback);
  }
  
  notify(selection: string) {
    this.observers.forEach(callback => callback(selection));
  }
}

// Factory pattern for action creation
class ActionFactory {
  static createAction(type: ActionType, data: any): QuickAction {
    switch (type) {
      case ActionType.MAP_IT:
        return new MapAction(data);
      case ActionType.EMAIL:
        return new EmailAction(data);
      case ActionType.CALENDAR:
        return new CalendarAction(data);
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }
}

// Strategy pattern for pattern recognition
class PatternRecognitionStrategy {
  private strategies: Map<PatternType, RecognitionStrategy> = new Map();
  
  constructor() {
    this.strategies.set(PatternType.ADDRESS, new AddressRecognition());
    this.strategies.set(PatternType.PHONE, new PhoneRecognition());
    this.strategies.set(PatternType.EMAIL, new EmailRecognition());
  }
  
  recognize(text: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    
    for (const [type, strategy] of this.strategies) {
      const result = strategy.match(text);
      if (result) {
        matches.push({ type, match: result, confidence: strategy.confidence });
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
}
```

### State Management Algorithm
```typescript
// Reactive state management system
class StateManager {
  private state: ExtensionState;
  private subscribers: Set<(state: ExtensionState) => void> = new Set();
  
  constructor() {
    this.state = this.loadInitialState();
  }
  
  async updateState(updates: Partial<ExtensionState>) {
    this.state = { ...this.state, ...updates };
    await this.persistState(this.state);
    this.notifySubscribers();
  }
  
  private async persistState(state: ExtensionState) {
    await chrome.storage.sync.set({ extensionState: state });
  }
  
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}
```

### Error Handling Algorithm
```typescript
// Systematic error handling with fallbacks
class ErrorHandler {
  static async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Operation failed in ${context}:`, error);
      
      // Log error for analysis
      await this.logError(error, context);
      
      // Execute fallback
      try {
        return fallback();
      } catch (fallbackError) {
        console.error(`Fallback also failed in ${context}:`, fallbackError);
        throw new Error(`Both operation and fallback failed in ${context}`);
      }
    }
  }
  
  private static async logError(error: Error, context: string) {
    const errorLog = {
      timestamp: Date.now(),
      context,
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent
    };
    
    await chrome.storage.local.set({ 
      errorLogs: [...(await this.getErrorLogs()), errorLog] 
    });
  }
}
```

---

## Systematic Testing Protocols

### Testing Architecture
```typescript
// Testing pyramid implementation
class TestingFramework {
  // Unit tests (70% of testing effort)
  static async runUnitTests(): Promise<TestResults> {
    const testSuites = [
      new PatternRecognitionTests(),
      new ActionExecutionTests(),
      new StateManagementTests()
    ];
    
    return await this.executeTestSuites(testSuites);
  }
  
  // Integration tests (20% of testing effort)
  static async runIntegrationTests(): Promise<TestResults> {
    const testSuites = [
      new ContentScriptIntegrationTests(),
      new BackgroundScriptIntegrationTests(),
      new StorageIntegrationTests()
    ];
    
    return await this.executeTestSuites(testSuites);
  }
  
  // E2E tests (10% of testing effort)
  static async runE2ETests(): Promise<TestResults> {
    const testSuites = [
      new UserWorkflowTests(),
      new CrossBrowserTests(),
      new PerformanceTests()
    ];
    
    return await this.executeTestSuites(testSuites);
  }
}
```

### Test Coverage Algorithm
```typescript
// Coverage analysis and reporting
class CoverageAnalyzer {
  static analyzeCoverage(testResults: TestResults): CoverageReport {
    const totalLines = this.countTotalLines();
    const coveredLines = this.countCoveredLines(testResults);
    const coverage = (coveredLines / totalLines) * 100;
    
    return {
      totalLines,
      coveredLines,
      coverage,
      uncoveredFiles: this.findUncoveredFiles(testResults),
      criticalPaths: this.identifyCriticalPaths(),
      recommendations: this.generateRecommendations(coverage)
    };
  }
  
  private static generateRecommendations(coverage: number): string[] {
    const recommendations: string[] = [];
    
    if (coverage < 80) {
      recommendations.push('Increase test coverage to minimum 80%');
    }
    
    if (coverage < 90) {
      recommendations.push('Target 90% coverage for production readiness');
    }
    
    return recommendations;
  }
}
```

---

## Security & Privacy Algorithms

### Data Privacy Implementation
```typescript
// Privacy-first data processing
class PrivacyManager {
  static async processTextLocally(text: string): Promise<ProcessedText> {
    // Keep sensitive operations local when possible
    const patterns = this.detectPatternsLocally(text);
    
    // Only send to cloud if explicitly requested and consented
    if (this.shouldUseCloudProcessing(patterns)) {
      return await this.processWithCloudAI(text);
    }
    
    return this.processLocally(text, patterns);
  }
  
  private static shouldUseCloudProcessing(patterns: Pattern[]): boolean {
    // Check user consent and data sensitivity
    return this.hasUserConsent() && !this.containsSensitiveData(patterns);
  }
  
  private static containsSensitiveData(patterns: Pattern[]): boolean {
    const sensitiveTypes = [PatternType.CREDIT_CARD, PatternType.SSN, PatternType.PASSWORD];
    return patterns.some(pattern => sensitiveTypes.includes(pattern.type));
  }
}
```

### Security Validation Algorithm
```typescript
// Comprehensive security validation
class SecurityValidator {
  static validateExtension(extension: Extension): SecurityReport {
    const checks = [
      this.validateManifest(extension.manifest),
      this.validateContentScripts(extension.contentScripts),
      this.validatePermissions(extension.permissions),
      this.validateExternalConnections(extension.externalConnections)
    ];
    
    const allPassed = checks.every(check => check.passed);
    const vulnerabilities = checks.filter(check => !check.passed);
    
    return {
      secure: allPassed,
      vulnerabilities,
      riskScore: this.calculateRiskScore(vulnerabilities),
      recommendations: this.generateSecurityRecommendations(vulnerabilities)
    };
  }
}
```

---

## Performance Optimization Algorithms

### Performance Monitoring Algorithm
```typescript
// Real-time performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  
  startMeasurement(operation: string): string {
    const id = crypto.randomUUID();
    const startTime = performance.now();
    
    this.metrics.set(id, [{
      operation,
      startTime,
      endTime: null,
      duration: null
    }]);
    
    return id;
  }
  
  endMeasurement(id: string): void {
    const endTime = performance.now();
    const metric = this.metrics.get(id)?.[0];
    
    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      
      // Alert if performance threshold exceeded
      if (metric.duration > this.getThreshold(metric.operation)) {
        this.alertPerformanceIssue(metric);
      }
    }
  }
  
  private getThreshold(operation: string): number {
    const thresholds = {
      'toolbar-appearance': 100,
      'pattern-detection': 50,
      'action-execution': 200
    };
    
    return thresholds[operation] || 1000;
  }
}
```

### Memory Management Algorithm
```typescript
// Memory leak prevention and cleanup
class MemoryManager {
  private listeners: Map<string, EventListener> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private observers: Map<string, MutationObserver> = new Map();
  
  registerEventListener(id: string, element: EventTarget, event: string, listener: EventListener) {
    element.addEventListener(event, listener);
    this.listeners.set(id, listener);
  }
  
  registerInterval(id: string, callback: () => void, delay: number) {
    const interval = setInterval(callback, delay);
    this.intervals.set(id, interval);
  }
  
  cleanup(id: string): void {
    // Clean up specific resource
    const listener = this.listeners.get(id);
    if (listener) {
      // Remove listener logic
      this.listeners.delete(id);
    }
    
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
    
    const observer = this.observers.get(id);
    if (observer) {
      observer.disconnect();
      this.observers.delete(id);
    }
  }
  
  cleanupAll(): void {
    // Clean up all resources
    this.listeners.clear();
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}
```

---

## User Experience Optimization

### Accessibility Implementation Algorithm
```typescript
// WCAG 2.1 AA compliance automation
class AccessibilityManager {
  static ensureCompliance(element: HTMLElement): void {
    // Ensure proper ARIA labels
    this.addARIALabels(element);
    
    // Ensure keyboard navigation
    this.enableKeyboardNavigation(element);
    
    // Ensure color contrast
    this.validateColorContrast(element);
    
    // Ensure focus management
    this.manageFocus(element);
  }
  
  private static addARIALabels(element: HTMLElement): void {
    const buttons = element.querySelectorAll('button');
    buttons.forEach(button => {
      if (!button.getAttribute('aria-label')) {
        button.setAttribute('aria-label', button.textContent || 'Button');
      }
    });
  }
  
  private static enableKeyboardNavigation(element: HTMLElement): void {
    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        (event.target as HTMLElement).click();
      }
    });
  }
}
```

### Responsive Design Algorithm
```typescript
// Adaptive UI system
class ResponsiveUIManager {
  private breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };
  
  adaptToScreenSize(): void {
    const width = window.innerWidth;
    const deviceType = this.getDeviceType(width);
    
    this.applyDeviceSpecificStyles(deviceType);
    this.optimizeLayout(deviceType);
    this.adjustInteractionMethods(deviceType);
  }
  
  private getDeviceType(width: number): string {
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }
  
  private applyDeviceSpecificStyles(deviceType: string): void {
    const root = document.documentElement;
    root.setAttribute('data-device', deviceType);
    
    // Apply CSS custom properties for device-specific styling
    const styles = this.getDeviceStyles(deviceType);
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(`--${property}`, value);
    });
  }
}
```

---

## Deployment & Distribution Automation

### Build Process Algorithm
```typescript
// Automated build pipeline
class BuildPipeline {
  static async build(environment: 'development' | 'production' | 'testing'): Promise<BuildResult> {
    const startTime = Date.now();
    
    try {
      // Clean previous build
      await this.cleanBuildDirectory();
      
      // Run type checking
      await this.runTypeCheck();
      
      // Run tests
      const testResults = await this.runTests();
      if (!testResults.success) {
        throw new Error('Tests failed');
      }
      
      // Build extension
      const buildResult = await this.buildExtension(environment);
      
      // Optimize for production
      if (environment === 'production') {
        await this.optimizeForProduction(buildResult);
      }
      
      // Generate build artifacts
      const artifacts = await this.generateArtifacts(buildResult);
      
      return {
        success: true,
        artifacts,
        duration: Date.now() - startTime,
        environment
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        environment
      };
    }
  }
}
```

### Chrome Web Store Automation
```typescript
// Automated store submission
class ChromeWebStoreManager {
  static async prepareSubmission(): Promise<SubmissionPackage> {
    // Generate required assets
    const assets = await this.generateAssets();
    
    // Generate documentation
    const documentation = await this.generateDocumentation();
    
    // Validate extension
    const validation = await this.validateExtension();
    
    if (!validation.valid) {
      throw new Error(`Extension validation failed: ${validation.errors.join(', ')}`);
    }
    
    return {
      assets,
      documentation,
      validation,
      timestamp: new Date().toISOString()
    };
  }
  
  private static async generateAssets(): Promise<StoreAssets> {
    return {
      icons: await this.generateIcons(),
      screenshots: await this.generateScreenshots(),
      promotionalImages: await this.generatePromotionalImages()
    };
  }
}
```

---

## Maintenance & Update Protocols

### Monitoring & Analytics Algorithm
```typescript
// Comprehensive monitoring system
class MonitoringSystem {
  private metrics: Map<string, MetricCollector> = new Map();
  
  startMonitoring(): void {
    // Monitor performance
    this.monitorPerformance();
    
    // Monitor errors
    this.monitorErrors();
    
    // Monitor user behavior
    this.monitorUserBehavior();
    
    // Monitor business metrics
    this.monitorBusinessMetrics();
  }
  
  private monitorPerformance(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.recordPerformanceMetric(entry);
      });
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  }
  
  private monitorErrors(): void {
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }
}
```

### Update Management Algorithm
```typescript
// Automated update system
class UpdateManager {
  static async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const response = await fetch('/api/updates/latest');
      const latestVersion = await response.json();
      
      const currentVersion = chrome.runtime.getManifest().version;
      
      if (this.isNewerVersion(latestVersion.version, currentVersion)) {
        return {
          version: latestVersion.version,
          changelog: latestVersion.changelog,
          downloadUrl: latestVersion.downloadUrl,
          mandatory: latestVersion.mandatory
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }
  
  static async performUpdate(updateInfo: UpdateInfo): Promise<boolean> {
    try {
      // Download update
      const updateBlob = await this.downloadUpdate(updateInfo.downloadUrl);
      
      // Install update
      await this.installUpdate(updateBlob);
      
      // Notify user
      this.notifyUserOfUpdate(updateInfo);
      
      return true;
    } catch (error) {
      console.error('Update failed:', error);
      return false;
    }
  }
}
```

---

## Collaboration & Version Control

### Git Workflow Algorithm
```typescript
// Automated Git workflow
class GitWorkflowManager {
  static async createFeatureBranch(featureName: string): Promise<string> {
    const branchName = `feature/${featureName}-${Date.now()}`;
    
    // Create and checkout feature branch
    await this.executeGitCommand(`checkout -b ${branchName}`);
    
    // Set upstream
    await this.executeGitCommand(`push -u origin ${branchName}`);
    
    return branchName;
  }
  
  static async createPullRequest(branchName: string, title: string, description: string): Promise<string> {
    // Create PR using GitHub API
    const response = await fetch('/api/github/pulls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        body: description,
        head: branchName,
        base: 'main'
      })
    });
    
    const pr = await response.json();
    return pr.html_url;
  }
  
  static async mergePullRequest(prNumber: number): Promise<boolean> {
    try {
      // Merge PR
      await fetch(`/api/github/pulls/${prNumber}/merge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merge_method: 'squash' })
      });
      
      // Delete feature branch
      await this.deleteFeatureBranch(prNumber);
      
      return true;
    } catch (error) {
      console.error('Failed to merge PR:', error);
      return false;
    }
  }
}
```

### Code Review Automation
```typescript
// Automated code review system
class CodeReviewAutomation {
  static async reviewPullRequest(prNumber: number): Promise<ReviewReport> {
    const changes = await this.getPullRequestChanges(prNumber);
    
    const review = {
      prNumber,
      timestamp: new Date().toISOString(),
      checks: await this.performAutomatedChecks(changes),
      recommendations: await this.generateRecommendations(changes)
    };
    
    // Post review comments
    await this.postReviewComments(prNumber, review);
    
    return review;
  }
  
  private static async performAutomatedChecks(changes: FileChange[]): Promise<CheckResult[]> {
    const checks = [
      await this.checkCodeStyle(changes),
      await this.checkTestCoverage(changes),
      await this.checkSecurity(changes),
      await this.checkPerformance(changes)
    ];
    
    return checks;
  }
}
```

---

## Key Success Factors

### Technical Excellence Metrics
- **Code Quality**: 90%+ test coverage, <5% technical debt
- **Performance**: <100ms response time, <50MB memory usage
- **Security**: 0 critical vulnerabilities, 100% security scan pass
- **Reliability**: 99.9% uptime, <0.1% error rate

### User Experience Metrics
- **Accessibility**: WCAG 2.1 AA compliance, 100% keyboard navigation
- **Performance**: <2s load time, smooth 60fps interactions
- **Usability**: <3 clicks to complete tasks, intuitive interface
- **Satisfaction**: >4.5/5 user rating, <2% support requests

### Business Success Metrics
- **Adoption**: 10k+ installs in 3 months, viral coefficient >1.0
- **Monetization**: 5%+ conversion rate, >$10k MRR in 6 months
- **Retention**: 40%+ paid retention, <5% churn rate
- **Growth**: 20%+ month-over-month growth, expanding user base

### AI Agent Efficiency Metrics
- **Task Completion**: >95% tasks completed autonomously
- **Error Recovery**: <2% errors require human intervention
- **Performance Optimization**: Continuous improvement in all metrics
- **Learning Rate**: 10%+ improvement in efficiency per iteration

---

## Resources & References

### Chrome Extension Development
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

### Development Tools & Automation
- [Vite Build Tool](https://vitejs.dev/) - Fast build tool for modern web development
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Jest Testing Framework](https://jestjs.io/) - Comprehensive testing solution
- [Playwright E2E Testing](https://playwright.dev/) - Reliable end-to-end testing

### Security & Compliance
- [OWASP Security Guidelines](https://owasp.org/) - Web application security
- [Chrome Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)
- [GDPR Compliance Guide](https://gdpr.eu/) - Data protection regulations

### Performance & Optimization
- [Web Performance Best Practices](https://web.dev/performance/) - Google's performance guide
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Performance profiling
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

This guide is designed for AI agents to systematically execute Chrome extension development with maximum efficiency, quality, and automation. Update protocols as new patterns and optimizations are discovered.
