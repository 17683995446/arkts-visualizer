import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "@/pages/Home";
import Graph from "@/pages/Graph";
import Analysis from "@/pages/Analysis";
import Query from "@/pages/Query";
import NotFound from "@/pages/NotFound";
import Navigation from "@/components/Navigation";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useGraphStore } from "@/store/useGraphStore";
import { logger } from "@/utils/debugLogger";

function KeyboardShortcuts() {
  const navigate = useNavigate();
  const { selectEntity } = useGraphStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        logger.debug('Keyboard shortcut: Toggle performance monitor');
        document.querySelector<HTMLButtonElement>('[title*="Performance Monitor"]')?.click();
      }

      if (e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          logger.debug('Keyboard shortcut: Navigate to Home');
          navigate('/');
        }
      }

      if (e.key === '2' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          logger.debug('Keyboard shortcut: Navigate to Graph');
          navigate('/graph');
        }
      }

      if (e.key === '3' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          logger.debug('Keyboard shortcut: Navigate to Analysis');
          navigate('/analysis');
        }
      }

      if (e.key === '4' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          logger.debug('Keyboard shortcut: Navigate to Query');
          navigate('/query');
        }
      }

      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          logger.debug('Keyboard shortcut: Deselect entity');
          selectEntity(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, selectEntity]);

  return null;
}

export default function App() {
  const { loadMockData, isLoading } = useGraphStore();
  const [showPerformance, setShowPerformance] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      loadMockData();
    }
  }, [hasInitialized, loadMockData]);

  return (
    <ErrorBoundary>
      <Router>
        <KeyboardShortcuts />
        <div className="min-h-screen bg-space-950 grid-background">
          <Navigation />
          <main className="ml-64">
            {isLoading && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="glass-panel rounded-2xl p-8 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-white font-medium">Loading data...</p>
                </div>
              </div>
            )}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/graph" element={<Graph />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/query" element={<Query />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {showPerformance && <PerformanceMonitor />}
          <button
            onClick={() => setShowPerformance(!showPerformance)}
            className="fixed bottom-4 left-64 ml-4 glass-panel border border-white/10 p-2 rounded-lg hover:bg-white/10 transition-colors z-50"
            title="Toggle Performance Monitor (Ctrl+P)"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </Router>
    </ErrorBoundary>
  );
}
