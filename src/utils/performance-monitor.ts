export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  totalOperations: number;
  averageDuration: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  operationsByType: Record<string, PerformanceMetric[]>;
  recommendations: string[];
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, number> = new Map();

  private constructor() {
    this.initializeThresholds();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeThresholds(): void {
    // Set performance thresholds based on requirements
    this.thresholds.set('toolbar-appearance', 100); // 100ms target
    this.thresholds.set('pattern-detection', 50);   // 50ms target
    this.thresholds.set('action-execution', 200);   // 200ms target
    this.thresholds.set('text-selection', 100);     // 100ms target
  }

  startMeasurement(operation: string, metadata?: Record<string, any>): string {
    const id = crypto.randomUUID();
    const startTime = performance.now();
    
    const metric: PerformanceMetric = {
      operation,
      startTime,
      metadata
    };
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push(metric);
    
    return id;
  }

  endMeasurement(operation: string): void {
    const endTime = performance.now();
    const metric = this.metrics.get(operation)?.[0];
    
    if (metric) {
      metric.endTime = endTime;
      metric.duration = endTime - metric.startTime;
      
      // Alert if performance threshold exceeded
      const threshold = this.getThreshold(metric.operation);
      if (threshold && metric.duration > threshold) {
        this.alertPerformanceIssue(metric, threshold);
      }
    }
  }

  private alertPerformanceIssue(metric: PerformanceMetric, threshold: number): void {
    console.warn(
      `Performance issue detected: ${metric.operation} took ${metric.duration?.toFixed(2)}ms ` +
      `(threshold: ${threshold}ms)`
    );
    
    // Could send to analytics or monitoring service
    this.reportToAnalytics(metric);
  }

  private reportToAnalytics(metric: PerformanceMetric): void {
    // In production, this would send data to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Send to analytics
      console.log('Performance metric sent to analytics:', metric);
    }
  }

  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.get(operation) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of Array.from(this.metrics.values())) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  generateReport(): PerformanceReport {
    const allMetrics = this.getMetrics();
    const completedMetrics = allMetrics.filter(m => m.duration !== undefined);
    
    if (completedMetrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        slowestOperation: null,
        fastestOperation: null,
        operationsByType: {},
        recommendations: ['No performance data available']
      };
    }

    const totalDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / completedMetrics.length;
    
    const slowestOperation = completedMetrics.reduce((slowest, current) => 
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );
    
    const fastestOperation = completedMetrics.reduce((fastest, current) => 
      (current.duration || 0) < (fastest.duration || 0) ? current : fastest
    );

    // Group operations by type
    const operationsByType: Record<string, PerformanceMetric[]> = {};
    for (const metric of completedMetrics) {
      if (!operationsByType[metric.operation]) {
        operationsByType[metric.operation] = [];
      }
      operationsByType[metric.operation].push(metric);
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    for (const [operation, metrics] of Object.entries(operationsByType)) {
      const avgDuration = metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length;
      const threshold = this.thresholds.get(operation);
      
      if (threshold && avgDuration > threshold) {
        recommendations.push(
          `${operation} is performing below target (avg: ${avgDuration.toFixed(2)}ms, target: ${threshold}ms)`
        );
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('All operations are performing within target thresholds');
    }

    return {
      totalOperations: completedMetrics.length,
      averageDuration,
      slowestOperation,
      fastestOperation,
      operationsByType,
      recommendations
    };
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Convenience methods for common operations
  measureToolbarAppearance(): string {
    return this.startMeasurement('toolbar-appearance');
  }

  measurePatternDetection(): string {
    return this.startMeasurement('pattern-detection');
  }

  measureActionExecution(): string {
    return this.startMeasurement('action-execution');
  }

  measureTextSelection(): string {
    return this.startMeasurement('text-selection');
  }

  // Performance optimization helpers
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memory usage monitoring
  getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  isMemoryUsageHigh(): boolean {
    const memoryUsage = this.getMemoryUsage();
    const threshold = 50 * 1024 * 1024; // 50MB threshold
    return memoryUsage > threshold;
  }

  private getThreshold(operation: string): number | undefined {
    return this.thresholds.get(operation);
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
