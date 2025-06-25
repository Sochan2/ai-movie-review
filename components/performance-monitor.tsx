"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    
    // Measure initial render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      setMetrics({
        loadTime: renderTime,
        renderTime,
        memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024) : undefined
      });
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRenderTime);

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isVisible]);

  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="mb-1">
        <strong>Performance Metrics:</strong>
      </div>
      {metrics && (
        <>
          <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
          <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
          {metrics.memoryUsage && (
            <div>Memory: {metrics.memoryUsage}MB</div>
          )}
        </>
      )}
      <div className="mt-2 text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
} 