import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-orbitron font-bold text-neon-cyan opacity-20">
            404
          </h1>
          <div className="relative -mt-20">
            <h2 className="text-4xl font-bold text-white mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 glass-panel rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-12 text-gray-500 text-sm">
          <p>Keyboard shortcuts:</p>
          <p className="mt-2">
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">1</kbd> Overview
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">2</kbd> Graph
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">3</kbd> Analysis
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">4</kbd> Query
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
