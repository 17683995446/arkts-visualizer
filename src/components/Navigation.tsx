import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Network, Code2, Search, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation: React.FC = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Overview' },
    { path: '/graph', icon: Network, label: 'Graph' },
    { path: '/analysis', icon: Code2, label: 'Analysis' },
    { path: '/query', icon: Search, label: 'Query' },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 glass-panel border-r border-glass-border z-50">
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-10"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center animate-glow-pulse">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-orbitron font-bold text-xl text-white neon-text">
              ArkTS
            </h1>
            <p className="text-xs text-gray-400">Visualizer</p>
          </div>
        </motion.div>

        <div className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30'
                      : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-neon-cyan' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span
                      className={`font-medium transition-colors ${
                        isActive ? 'text-neon-cyan' : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="glass-panel rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-2">Version</p>
          <p className="font-mono text-neon-cyan text-sm">1.0.0</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
