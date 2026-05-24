import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import OptimizedGraph3D from './OptimizedGraph3D';
import ExtremeOptimizedGraph3D from './ExtremeOptimizedGraph3D';
import { useGraphStore } from '@/store/useGraphStore';
import { logger } from '@/utils/debugLogger';

interface SafeGraph3DProps {
  className?: string;
}

const SafeGraph3D: React.FC<SafeGraph3DProps> = ({ className }) => {
  const { graphData, isLoading: storeLoading, statistics } = useGraphStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    const loadTimer = setTimeout(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }, 800);

    return () => {
      isMounted.current = false;
      clearTimeout(loadTimer);
    };
  }, []);

  const handleError = (error: Error) => {
    logger.error('Graph3D error:', error);
    if (isMounted.current) {
      setHasError(true);
      setError(error);
    }
  };

  if (hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${className || ''}`}>
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">Visualization Error</h3>
        <p className="text-gray-400 text-sm mb-4">{error?.message || 'Unable to render the graph'}</p>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
          }}
          className="px-4 py-2 bg-neon-cyan/20 text-neon-cyan rounded-lg hover:bg-neon-cyan/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading || storeLoading) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center ${className || ''}`}>
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin mb-4" />
        <p className="text-gray-400">Loading visualization...</p>
      </div>
    );
  }

  if (!graphData.entities.length) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-8 ${className || ''}`}>
        <div className="text-center glass-panel rounded-2xl p-8">
          <h3 className="text-white text-lg font-semibold mb-2">No Data Yet</h3>
          <p className="text-gray-400 text-sm">Load a project to see the visualization</p>
        </div>
      </div>
    );
  }

  try {
    // 根据数据集大小选择渲染引擎
    const isExtreme = statistics.totalEntities > 2000;
    
    return (
      <div className={className}>
        {isExtreme ? (
          <ExtremeOptimizedGraph3D 
            entities={graphData.entities} 
            relationships={graphData.relationships} 
          />
        ) : (
          <OptimizedGraph3D 
            entities={graphData.entities} 
            relationships={graphData.relationships} 
          />
        )}
      </div>
    );
  } catch (error) {
    handleError(error as Error);
    return null;
  }
};

export default SafeGraph3D;
