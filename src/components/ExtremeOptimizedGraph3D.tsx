import React, { useRef, useState, useMemo, useCallback } from 'react';
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
  return result;
}

function hasValidPosition(entity: Entity): boolean {
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

interface ExtremeOptimizedGraph3DProps {
  entities: Entity[];
  relationships: Relationship[];
}

const ExtremeOptimizedGraph3D: React.FC<ExtremeOptimizedGraph3DProps> = ({ entities, relationships }) => {
  const { statistics } = useGraphStore();
  
  const entityCount = statistics.totalEntities;
  const isHugeDataset = entityCount > 2000;
  const isExtremeDataset = entityCount > 8000;
  
  return (
    <div className="w-full h-full bg-space-950">
      <Canvas camera={{ position: [0, 15, 30], fov: 60 }}>
        <color attach="background" args={['#0A0F1C']} />
        <Stars radius={100} depth={50} count={isExtremeDataset ? 500 : isHugeDataset ? 1000 : 5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} color="#00E5FF" intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#9D4EDD" intensity={1} />
        
        <ExtremeOptimizedGraphContent 
          entities={entities} 
          relationships={relationships} 
          isHugeDataset={isHugeDataset}
          isExtremeDataset={isExtremeDataset}
        />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={10} 
          maxDistance={100}
        />
      </Canvas>
    </div>
  );
};

const ExtremeOptimizedGraphContent: React.FC<{
  entities: Entity[];
  relationships: Relationship[];
  isHugeDataset: boolean;
  isExtremeDataset: boolean;
}> = ({ entities, relationships, isHugeDataset, isExtremeDataset }) => {
  const { selectedEntity, selectEntity, visibleEntityTypes, searchQuery } = useGraphStore();
  
  // 第一性原理优化：使用 HashMap 实现 O(1) 查找
  const { visibleEntities, visibleRelationships, entityMap, renderEntities } = useMemo(() => {
    logger.debug('ExtremeOptimizedGraphContent filtering', { 
      totalEntities: entities.length, 
      totalRelationships: relationships.length,
      isExtremeDataset
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

    const filteredRelationships = isExtremeDataset ? [] : relationships.filter(rel => {
      if (!rel || !rel.sourceId || !rel.targetId) return false;
      return map.has(rel.sourceId) && map.has(rel.targetId);
    });

    // 极限数据集时，采样渲染实体
    const finalRenderEntities = isExtremeDataset 
      ? filteredEntities.filter((_, index) => index % 3 === 0) 
      : filteredEntities;

    logger.debug('ExtremeOptimizedGraphContent filtered', { 
      visibleEntities: filteredEntities.length, 
      visibleRelationships: filteredRelationships.length,
      renderEntities: finalRenderEntities.length,
      isExtremeDataset
    });

    return {
      visibleEntities: filteredEntities,
      visibleRelationships: filteredRelationships,
      entityMap: map,
      renderEntities: finalRenderEntities
    };
  }, [entities, relationships, visibleEntityTypes, searchQuery, isExtremeDataset]);

  return (
    <group>
      {/* 极限或大数据集时不渲染关系线 */}
      {!isHugeDataset && visibleRelationships.map((rel) => {
        try {
          const source = entityMap.get(rel.sourceId);
          const target = entityMap.get(rel.targetId);
          if (!source || !target || !hasValidPosition(source) || !hasValidPosition(target)) return null;
          
          const isHighlighted = selectedEntity?.id === source.id || selectedEntity?.id === target.id;
          if (!isHighlighted) return null;
          
          return (
            <OptimizedGraphLine
              key={rel.id || Math.random().toString(36)}
              start={source.position!}
              end={target.position!}
              color={isHighlighted ? '#00E5FF' : '#ffffff20'}
              highlighted={isHighlighted}
            />
          );
        } catch (error) {
          logger.warn('Error rendering extreme relationship:', error);
          return null;
        }
      })}

      {/* 渲染节点 */}
      {renderEntities.map((entity) => (
        <React.Fragment key={entity.id || Math.random().toString(36)}>
          {hasValidPosition(entity) && (
            <ExtremeOptimizedGraphNode
              entity={entity}
              isSelected={selectedEntity?.id === entity.id}
              onClick={selectEntity}
              isHugeDataset={isHugeDataset}
              isExtremeDataset={isExtremeDataset}
            />
          )}
        </React.Fragment>
      ))}
    </group>
  );
};

interface ExtremeOptimizedGraphNodeProps {
  entity: Entity;
  isSelected: boolean;
  onClick: (entity: Entity) => void;
  isHugeDataset: boolean;
  isExtremeDataset: boolean;
}

const ExtremeOptimizedGraphNode: React.FC<ExtremeOptimizedGraphNodeProps> = ({ 
  entity, isSelected, onClick, isHugeDataset, isExtremeDataset 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  if (!entity || !hasValidPosition(entity)) return null;
  
  const color = getSafeColor(entity.type);
  const baseScale = isExtremeDataset ? 0.5 : isHugeDataset ? 0.7 : 1;
  const selectedScale = isExtremeDataset ? 0.8 : isHugeDataset ? 1.1 : 1.6;
  const hoverScale = isExtremeDataset ? 0.6 : isHugeDataset ? 0.9 : 1.3;
  const scale = isSelected ? selectedScale : hovered ? hoverScale : baseScale;
  
  // 只在需要时动画
  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.rotation.x += delta * (isExtremeDataset ? 0.5 : 1.5);
      meshRef.current.rotation.y += delta * (isExtremeDataset ? 0.3 : 1);
    }
  });

  const handleClick = useCallback((e: any) => {
    try {
      e.stopPropagation();
      logger.info('Extreme node clicked', { entityId: entity.id, entityName: entity.name });
      onClick(entity);
    } catch (error) {
      logger.warn('Error handling extreme node click:', error);
    }
  }, [onClick, entity]);
  
  const handleHover = useCallback(() => setHovered(true), []);
  const handleUnhover = useCallback(() => setHovered(false), []);

  return (
    <Float 
      speed={isExtremeDataset ? 0.2 : isHugeDataset ? 0.5 : 1} 
      rotationIntensity={isExtremeDataset ? 0.05 : isHugeDataset ? 0.1 : 0.3} 
      floatIntensity={isExtremeDataset ? 0.1 : isHugeDataset ? 0.2 : 0.4}
    >
      <group position={[entity.position!.x, entity.position!.y, entity.position!.z]}>
        {/* 发光效果 */}
        {(hovered || isSelected) && (
          <mesh>
            <sphereGeometry args={[0.5 * scale, isExtremeDataset ? 4 : isHugeDataset ? 8 : 16, isExtremeDataset ? 4 : isHugeDataset ? 8 : 16]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={0.25} 
            />
          </mesh>
        )}
        
        {/* 主节点 - 使用最简化 */}
        <mesh
          ref={meshRef}
          scale={[scale, scale, scale]}
          onClick={handleClick}
          onPointerOver={handleHover}
          onPointerOut={handleUnhover}
        >
          <icosahedronGeometry args={[0.3, isExtremeDataset ? 1 : isHugeDataset ? 1 : 1]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2.5 : hovered ? 1.5 : isExtremeDataset ? 0.2 : 0.4}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* 标签 - 只有选中或悬停时显示 */}
        {(!isExtremeDataset || hovered || isSelected) && (
          <Html distanceFactor={isExtremeDataset ? 25 : isHugeDataset ? 20 : 16}>
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

export default ExtremeOptimizedGraph3D;
