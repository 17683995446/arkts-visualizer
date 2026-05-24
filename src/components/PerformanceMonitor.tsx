import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu } from 'lucide-react';

interface PerformanceMetrics {
  fps: number;
  memory: number | null;
  lastUpdated: number;
  frameCount: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: null,
    lastUpdated: Date.now(),
    frameCount: 0,
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const animationFrameId = useRef<number>();
  const isMounted = useRef(true);
  const lastCleanup = useRef(Date.now());

  useEffect(() => {
    isMounted.current = true;
    
    const measurePerformance = () => {
      if (!isMounted.current) return;
      
      frameCountRef.current++;
      const now = Date.now();
      const delta = now - lastTimeRef.current;

      if (delta >= 2000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        
        let memory: number | null = null;
        try {
          const perf = performance as any;
          if (perf.memory) {
            memory = Math.round(perf.memory.usedJSHeapSize / 1024 / 1024);
          }
        } catch (error) {
          memory = null;
        }

        if (isMounted.current) {
          setMetrics({
            fps,
            memory,
            lastUpdated: now,
            frameCount: frameCountRef.current,
          });
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationFrameId.current = requestAnimationFrame(measurePerformance);
    };

    animationFrameId.current = requestAnimationFrame(measurePerformance);

    return () => {
      isMounted.current = false;
      
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = undefined;
      }
    };
  }, []);

  const getFpsColor = (fps: number) => {
    if (fps >= 55) return 'text-neon-green';
    if (fps >= 30) return 'text-neon-purple';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 glass-panel border border-white/10 rounded-xl p-4 z-50">
      <div className="flex items-center gap-3 mb-2">
        <Cpu className="w-4 h-4 text-neon-cyan" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Performance</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">FPS</p>
          <p className={`font-mono font-bold ${getFpsColor(metrics.fps)}`}>
            {metrics.fps}
          </p>
        </div>
        {metrics.memory !== null && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Memory</p>
            <p className="font-mono font-bold text-neon-purple">
              {metrics.memory} MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
