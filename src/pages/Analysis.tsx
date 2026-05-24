import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronDown, FileCode, Box, Box as BoxIcon, FunctionSquare, Database } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import { Entity, EntityType } from '@/types';
import { ENTITY_TYPE_COLORS } from '@/lib/mockData';

const getIconForType = (type: EntityType) => {
  switch (type) {
    case 'File':
      return FileCode;
    case 'Class':
      return BoxIcon;
    case 'Component':
      return Database;
    case 'Method':
      return FunctionSquare;
    case 'Field':
    case 'StateVariable':
      return Box;
    default:
      return Box;
  }
};

const Analysis: React.FC = () => {
  const { graphData, selectEntity } = useGraphStore();
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());

  const files = useMemo(() => 
    graphData.entities.filter(e => e.type === 'File'), 
    [graphData.entities]
  );

  const toggleFile = (fileId: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(fileId)) {
      newExpanded.delete(fileId);
    } else {
      newExpanded.add(fileId);
    }
    setExpandedFiles(newExpanded);
  };

  const toggleEntity = (entityId: string) => {
    const newExpanded = new Set(expandedEntities);
    if (newExpanded.has(entityId)) {
      newExpanded.delete(entityId);
    } else {
      newExpanded.add(entityId);
    }
    setExpandedEntities(newExpanded);
  };

  const getChildEntities = useMemo(() => (parentId: string): Entity[] => {
    return graphData.relationships
      .filter(rel => rel.sourceId === parentId && rel.type === 'CONTAINS')
      .map(rel => graphData.entities.find(e => e.id === rel.targetId))
      .filter((e): e is Entity => e !== undefined);
  }, [graphData.entities, graphData.relationships]);

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-orbitron text-3xl font-bold text-white neon-text mb-2">
          Code Analysis
        </h1>
        <p className="text-gray-400">
          Browse and explore your codebase structure
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Tree */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-panel rounded-2xl p-6 h-full">
            <h2 className="font-orbitron text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-neon-cyan" />
              Files
            </h2>
            <div className="space-y-1">
              {files.map((file, index) => {
                const isExpanded = expandedFiles.has(file.id);
                const children = getChildEntities(file.id);
                
                return (
                  <div key={file.id}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <FileTreeItem
                        entity={file}
                        isExpanded={isExpanded}
                        hasChildren={children.length > 0}
                        onToggle={() => toggleFile(file.id)}
                        onSelect={() => selectEntity(file)}
                      />
                    </motion.div>

                    {isExpanded && children.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-2">
                        {children.map((child, idx) => (
                          <RecursiveTreeItem
                            key={child.id}
                            entity={child}
                            level={1}
                            getChildEntities={getChildEntities}
                            expandedEntities={expandedEntities}
                            onToggle={toggleEntity}
                            onSelect={selectEntity}
                            delay={0.3 + index * 0.05 + idx * 0.02}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Entity List */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-orbitron text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BoxIcon className="w-5 h-5 text-neon-purple" />
            All Entities
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {graphData.entities.map((entity, index) => {
              const Icon = getIconForType(entity.type);
              
              return (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.01 }}
                  whileHover={{ x: 4 }}
                  onClick={() => selectEntity(entity)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${ENTITY_TYPE_COLORS[entity.type]}20` }}
                  >
                    <Icon 
                      className="w-4 h-4" 
                      style={{ color: ENTITY_TYPE_COLORS[entity.type] }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{entity.name}</p>
                    <p className="text-gray-500 text-xs font-mono">{entity.type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                </motion.div>
              );
            })}
          </div>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

interface TreeItemProps {
  entity: Entity;
  level: number;
  getChildEntities: (id: string) => Entity[];
  expandedEntities: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (entity: Entity) => void;
  delay: number;
}

const RecursiveTreeItem: React.FC<TreeItemProps> = ({
  entity,
  level,
  getChildEntities,
  expandedEntities,
  onToggle,
  onSelect,
  delay
}) => {
  const children = getChildEntities(entity.id);
  const isExpanded = expandedEntities.has(entity.id);
  const Icon = getIconForType(entity.type);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
      >
        <FileTreeItem
          entity={entity}
          isExpanded={isExpanded}
          hasChildren={children.length > 0}
          onToggle={() => onToggle(entity.id)}
          onSelect={() => onSelect(entity)}
        />
      </motion.div>

      {isExpanded && children.length > 0 && (
        <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-2">
          {children.map((child, idx) => (
            <RecursiveTreeItem
              key={child.id}
              entity={child}
              level={level + 1}
              getChildEntities={getChildEntities}
              expandedEntities={expandedEntities}
              onToggle={onToggle}
              onSelect={onSelect}
              delay={delay + 0.02 + idx * 0.01}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FileTreeItemProps {
  entity: Entity;
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  onSelect: () => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({
  entity,
  isExpanded,
  hasChildren,
  onToggle,
  onSelect
}) => {
  const Icon = getIconForType(entity.type);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) onToggle();
        }}
        className={`w-5 h-5 flex items-center justify-center ${hasChildren ? 'hover:bg-white/10 rounded' : ''}`}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )
        ) : (
          <div className="w-3 h-3" />
        )}
      </button>
      <div 
        className="w-6 h-6 rounded flex items-center justify-center"
        style={{ backgroundColor: `${ENTITY_TYPE_COLORS[entity.type]}20` }}
      >
        <Icon 
          className="w-3 h-3" 
          style={{ color: ENTITY_TYPE_COLORS[entity.type] }}
        />
      </div>
      <div className="flex-1" onClick={onSelect}>
        <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
          {entity.name}
        </span>
      </div>
    </div>
  );
};

export default Analysis;
