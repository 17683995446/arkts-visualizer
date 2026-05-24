import React, { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Entity, Relationship } from '@/types';
import { ENTITY_TYPE_COLORS } from '@/lib/mockData';
import { useGraphStore } from '@/store/useGraphStore';
import { logger } from '@/utils/debugLogger';

// 安全的坐标验证函数
function isSafeCoordinate(coord: number): boolean {
  const result = (
    typeof coord === 'number' && 
    !isNaN(coord) && 
    isFinite(coord) &&
    coord > -1000 &&
    coord < 1000
  );
  // 减少日志频率，避免性能问题
  return result;
}

function hasValidPosition(entity: Entity): boolean {
  // 减少频繁调用的日志，只在异常时记录
  if (!entity) {
    logger.warn('hasValidPosition called with null/undefined entity');
    return false;
  }
  
  if (!entity.position) {
    return false;
  }
  
  const valid = (
    entity.position &&
    isSafeCoordinate(entity.position.x) &&
    isSafeCoordinate(entity.position.y) &&
    isSafeCoordinate(entity.position.z)
  );
  
  return valid;
}

// 安全的颜色获取
function getSafeColor(entityType: string): string {
  return ENTITY_TYPE_COLORS[entityType as keyof typeof ENTITY_TYPE_COLORS] || '#ffffff';
}

interface OptimizedGraph3DProps {
  entities: Entity[];
  relationships: Relationship[];
}

const OptimizedGraph3D: React.FC<OptimizedGraph3DProps> = ({ entities, relationships }) => {
  const { statistics } = useGraphStore();
  
  // 验证输入
  const safeEntities = useMemo(() => {
    if (!Array.isArray(entities)) return [];
    return entities;
  }, [entities]);
  
  const safeRelationships = useMemo(() => {
    if (!Array.isArray(relationships)) return [];
    return relationships;
  }, [relationships]);
  
  const isLargeDataset = statistics.totalEntities > 200;
  
  return (
    <div className="w-full h-full bg-space-950">
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <color attach="background" args={['#0A0F1C']} />
        <Stars radius={100} depth={50} count={isLargeDataset ? 1000 : 5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} color="#00E5FF" intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#9D4EDD" intensity={1} />
        
        <OptimizedGraphContent 
          entities={safeEntities} 
          relationships={safeRelationships} 
          isLargeDataset={isLargeDataset}
        />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={5} 
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
};

const OptimizedGraphContent: React.FC<{
  entities: Entity[];
  relationships: Relationship[];
  isLargeDataset: boolean;
}> = ({ entities, relationships, isLargeDataset }) => {
  const { selectedEntity, selectEntity, visibleEntityTypes, searchQuery } = useGraphStore();
  const [showAllRelationships, setShowAllRelationships] = useState(false);
  const [maxRelationshipsToShow, setMaxRelationshipsToShow] = useState(500);
  
  // 第一性原理优化：使用 HashMap 实现 O(1) 查找
  const { visibleEntities, visibleRelationships, entityMap, relationshipStats } = useMemo(() => {
    if (!Array.isArray(entities)) {
      return { visibleEntities: [], visibleRelationships: [], entityMap: new Map(), relationshipStats: { total: 0, shown: 0 } };
    }
    
    logger.debug('OptimizedGraphContent filtering', { 
      totalEntities: entities.length, 
      totalRelationships: relationships.length 
    });
    
    const filteredEntities = entities.filter(entity => {
      if (!entity || !entity.type || !entity.id) return false;
      
      const isTypeVisible = visibleEntityTypes.includes(entity.type);
      if (!isTypeVisible) return false;
      
      if (!hasValidPosition(entity)) return false;
      
      if (searchQuery === '') return true;
      
      const safeName = (entity.name || '').toLowerCase();
      const safeFullName = (entity.fullName || '').toLowerCase();
      const query = (searchQuery || '').toLowerCase();
      
      return safeName.includes(query) || safeFullName.includes(query);
    });

    // 核心优化：O(n) 构建 HashMap，O(1) 查找
    const map = new Map<string, Entity>();
    filteredEntities.forEach(entity => {
      if (entity.id && hasValidPosition(entity)) {
        map.set(entity.id, entity);
      }
    });

    // 防御性筛选关系
    let filteredRelationships = Array.isArray(relationships) ? relationships.filter(rel => {
      if (!rel || !rel.sourceId || !rel.targetId) return false;
      return map.has(rel.sourceId) && map.has(rel.targetId);
    }) : [];

    const totalRelationships = filteredRelationships.length;

    // 🚀 按需加载优化：如果不是"显示所有"，只显示选中实体的关系
    if (!showAllRelationships && selectedEntity) {
      const selectedId = selectedEntity.id;
      filteredRelationships = filteredRelationships.filter(rel => 
        rel.sourceId === selectedId || rel.targetId === selectedId
      );
    }

    // 如果数量超过限制，只显示前N个
    if (filteredRelationships.length > maxRelationshipsToShow) {
      filteredRelationships = filteredRelationships.slice(0, maxRelationshipsToShow);
    }

    logger.debug('OptimizedGraphContent filtered', { 
      visibleEntities: filteredEntities.length, 
      visibleRelationships: filteredRelationships.length,
      totalRelationships,
      showAllRelationships,
      selectedEntity: selectedEntity?.name
    });

    return {
      visibleEntities: filteredEntities,
      visibleRelationships: filteredRelationships,
      entityMap: map,
      relationshipStats: { total: totalRelationships, shown: filteredRelationships.length }
    };
  }, [entities, relationships, visibleEntityTypes, searchQuery, showAllRelationships, selectedEntity, maxRelationshipsToShow]);

  return (
    <group>
      {/* 🚀 关系线数量提示 */}
      {isLargeDataset && (
        <Html position={[-15, 10, 0]}>
          <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
            <p>Relations: {relationshipStats.shown} / {relationshipStats.total}</p>
            <button 
              onClick={() => setShowAllRelationships(!showAllRelationships)}
              className="mt-1 px-2 py-1 bg-neon-cyan/20 rounded text-neon-cyan hover:bg-neon-cyan/30"
            >
              {showAllRelationships ? 'Show Selected Only' : 'Show All'}
            </button>
          </div>
        </Html>
      )}
      
      {/* 先渲染关系线，这样节点会在上面 */}
      {!isLargeDataset && visibleRelationships.map((rel) => {
        try {
          const source = entityMap.get(rel.sourceId);
          const target = entityMap.get(rel.targetId);
          if (!source || !target || !hasValidPosition(source) || !hasValidPosition(target)) return null;
          
          const isHighlighted = selectedEntity?.id === source.id || selectedEntity?.id === target.id;
          
          return (
            <OptimizedGraphLine
              key={rel.id || Math.random().toString(36)}
              start={source.position!}
              end={target.position!}
              color={isHighlighted ? '#00E5FF' : '#ffffff30'}
              highlighted={isHighlighted}
            />
          );
        } catch (error) {
          logger.warn('Error rendering relationship line', error);
          return null;
        }
      })}

      {/* 渲染节点 */}
      {visibleEntities.map((entity) => (
        <React.Fragment key={entity.id || Math.random().toString(36)}>
          {hasValidPosition(entity) && (
            <OptimizedGraphNode
              entity={entity}
              isSelected={selectedEntity?.id === entity.id}
              onClick={selectEntity}
              isLargeDataset={isLargeDataset}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  );
};

interface OptimizedGraphNodeProps {
  entity: Entity;
  isSelected: boolean;
  onClick: (entity: Entity) => void;
  isLargeDataset: boolean;
}

const OptimizedGraphNode: React.FC<OptimizedGraphNodeProps> = ({ entity, isSelected, onClick, isLargeDataset }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // 防御性检查
  if (!entity || !hasValidPosition(entity)) return null;
  
  const color = getSafeColor(entity.type);
  const baseScale = 1;
  const selectedScale = 1.6;
  const hoverScale = 1.3;
  const scale = isSelected ? selectedScale : hovered ? hoverScale : baseScale;
  
  // 只在需要时动画
  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.y += delta * 1;
    }
  });
  
  const handleClick = useCallback((e: any) => {
    try {
      e.stopPropagation();
      logger.info('Node clicked', { entityId: entity.id, entityName: entity.name });
      onClick(entity);
    } catch (error) {
      logger.warn('Error handling node click:', error);
    }
  }, [onClick, entity]);

  const handleHover = useCallback(() => {
    setHovered(true);
  }, []);
  
  const handleUnhover = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <Float 
      speed={hovered || isSelected ? 3 : (isLargeDataset ? 0.5 : 1.5)} 
      rotationIntensity={isLargeDataset ? 0.1 : 0.3} 
      floatIntensity={isLargeDataset ? 0.2 : 0.4}
    >
      <group position={[entity.position!.x, entity.position!.y, entity.position!.z]}>
        {/* 发光效果 - 只有选中或悬停时显示 */}
        {(hovered || isSelected) && (
          <mesh>
            <sphereGeometry args={[0.5 * scale, isLargeDataset ? 8 : 16, isLargeDataset ? 8 : 16]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.25} 
            />
          </mesh>
        )}
        
        {/* 主节点 */}
        <mesh
          ref={meshRef}
          scale={[scale, scale, scale]}
          onClick={handleClick}
          onPointerOver={handleHover}
          onPointerOut={handleUnhover}
        >
          <icosahedronGeometry args={[0.3, isLargeDataset ? 1 : 1]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2.5 : hovered ? 1.5 : 0.4}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* 标签 - 大数据集时只在选中或悬停时显示 */}
        {(!isLargeDataset || hovered || isSelected) && (
          <Html distanceFactor={16}>
            <div
              className={`px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap transition-all duration-200 pointer-events-none ${
                isSelected 
                  ? 'bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/60 shadow-lg shadow-neon-cyan/30' 
                  : hovered 
                    ? 'bg-white/15 text-white border border-white/40' 
                    : 'bg-black/40 text-gray-300'
              }`}
            >
              {entity.name}
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
};

interface OptimizedGraphLineProps {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  color: string;
  highlighted: boolean;
}

const OptimizedGraphLine: React.FC<OptimizedGraphLineProps> = ({ start, end, color, highlighted }) => {
  // 防御性检查
  if (!start || !end) return null;
  
  // 验证坐标安全
  if (!isSafeCoordinate(start.x) || !isSafeCoordinate(start.y) || !isSafeCoordinate(start.z) ||
      !isSafeCoordinate(end.x) || !isSafeCoordinate(end.y) || !isSafeCoordinate(end.z)) {
    return null;
  }
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([
            start.x, start.y, start.z,
            end.x, end.y, end.z
          ])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={highlighted ? 0.8 : 0.35}
        linewidth={highlighted ? 2 : 1}
      />
    </line>
  );
};

export default OptimizedGraph3D;
