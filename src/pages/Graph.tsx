import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Info } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import SafeGraph3D from '@/components/SafeGraph3D';
import { EntityType } from '@/types';
import { ENTITY_TYPE_COLORS } from '@/lib/mockData';

const Graph: React.FC = () => {
  const { 
    selectedEntity, 
    selectEntity, 
    visibleEntityTypes, 
    toggleEntityTypeVisibility,
    searchQuery,
    setSearchQuery
  } = useGraphStore();

  const entityTypes: EntityType[] = ['File', 'Class', 'Component', 'Method', 'Field', 'StateVariable'];

  return (
    <div className="min-h-screen flex">
      {/* Main Graph Area */}
      <div className="flex-1 relative">
        <SafeGraph3D />
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="glass-panel rounded-xl p-2 flex items-center gap-3 w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 font-mono text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Filters */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="w-80 glass-panel border-l border-glass-border p-6 overflow-y-auto"
      >
        <div className="mb-8">
          <h2 className="font-orbitron text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-neon-cyan" />
            Entity Types
          </h2>
          <div className="space-y-2">
            {entityTypes.map((type) => {
              const isVisible = visibleEntityTypes.includes(type);
              const color = ENTITY_TYPE_COLORS[type];
              
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleEntityTypeVisibility(type)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    isVisible ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: color,
                        boxShadow: isVisible ? `0 0 10px ${color}` : 'none'
                      }}
                    />
                    <span className="text-gray-300 text-sm font-medium">{type}</span>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    isVisible ? 'border-neon-cyan bg-neon-cyan/20' : 'border-gray-600'
                  }`}>
                    {isVisible && <div className="w-2 h-2 rounded-full bg-neon-cyan" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Entity Info */}
        {selectedEntity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-5"
            style={{ borderColor: `${ENTITY_TYPE_COLORS[selectedEntity.type]}50` }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-lg font-semibold text-white flex items-center gap-2">
                <Info className="w-5 h-5" style={{ color: ENTITY_TYPE_COLORS[selectedEntity.type] }} />
                Details
              </h2>
              <button
                onClick={() => selectEntity(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Type</p>
                <p 
                  className="font-mono font-bold"
                  style={{ color: ENTITY_TYPE_COLORS[selectedEntity.type] }}
                >
                  {selectedEntity.type}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Name</p>
                <p className="text-white font-medium">{selectedEntity.name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="text-gray-300 text-sm font-mono break-all">{selectedEntity.fullName}</p>
              </div>

              {selectedEntity.filePath && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">File</p>
                  <p className="text-gray-300 text-sm font-mono break-all">{selectedEntity.filePath}</p>
                </div>
              )}

              {Object.keys(selectedEntity.properties).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Properties</p>
                  <div className="bg-black/30 rounded-lg p-3 space-y-1">
                    {Object.entries(selectedEntity.properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-400">{key}:</span>
                        <span className="text-neon-cyan font-mono">
                          {typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="mt-8">
          <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-3">Legend</h3>
          <div className="space-y-2 text-xs text-gray-300">
            <p>• Click nodes to select</p>
            <p>• Drag to rotate view</p>
            <p>• Scroll to zoom</p>
            <p>• Right-click + drag to pan</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Graph;
