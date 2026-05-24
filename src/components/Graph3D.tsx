import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Entity, Relationship } from '@/types';
import { ENTITY_TYPE_COLORS } from '@/lib/mockData';
import { useGraphStore } from '@/store/useGraphStore';

interface Graph3DProps {
  entities: Entity[];
  relationships: Relationship[];
}

const Graph3D: React.FC<Graph3DProps> = ({ entities, relationships }) => {
  return (
    <div className="w-full h-full bg-space-950">
      <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
        <color attach="background" args={['#0A0F1C']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} color="#00E5FF" intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#9D4EDD" intensity={1} />
        
        <GraphContent entities={entities} relationships={relationships} />
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

const GraphContent: React.FC<Graph3DProps> = ({ entities, relationships }) => {
  const { selectedEntity, selectEntity, visibleEntityTypes, searchQuery } = useGraphStore();
  
  // 使用 useMemo 缓存计算结果，提高性能
  const { visibleEntities, visibleRelationships } = useMemo(() => {
    const filteredEntities = entities.filter(entity => {
      const isTypeVisible = visibleEntityTypes.includes(entity.type);
      const matchesSearch = searchQuery === '' || 
        entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.fullName.toLowerCase().includes(searchQuery.toLowerCase());
      return isTypeVisible && matchesSearch;
    });

    const visibleIds = new Set(filteredEntities.map(e => e.id));
    
    const filteredRelationships = relationships.filter(rel => {
      return visibleIds.has(rel.sourceId) && visibleIds.has(rel.targetId);
    });

    return {
      visibleEntities: filteredEntities,
      visibleRelationships: filteredRelationships
    };
  }, [entities, relationships, visibleEntityTypes, searchQuery]);

  return (
    <group>
      {/* 先渲染关系线，这样节点会在上面 */}
      {visibleRelationships.map((rel) => {
        const source = visibleEntities.find(e => e.id === rel.sourceId);
        const target = visibleEntities.find(e => e.id === rel.targetId);
        if (!source || !target || !source.position || !target.position) return null;
        
        const isHighlighted = selectedEntity?.id === source.id || selectedEntity?.id === target.id;
        
        return (
          <GraphLine
            key={rel.id}
            start={source.position}
            end={target.position}
            color={isHighlighted ? '#00E5FF' : '#ffffff30'}
            highlighted={isHighlighted}
          />
        );
      })}

      {/* 渲染节点 */}
      {visibleEntities.map((entity) => (
        <GraphNode
          key={entity.id}
          entity={entity}
          isSelected={selectedEntity?.id === entity.id}
          onClick={() => selectEntity(entity)}
        />
      ))}
    </group>
  );
};

interface GraphNodeProps {
  entity: Entity;
  isSelected: boolean;
  onClick: () => void;
}

const GraphNode: React.FC<GraphNodeProps> = ({ entity, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const color = ENTITY_TYPE_COLORS[entity.type];
  const baseScale = 1;
  const selectedScale = 1.6;
  const hoverScale = 1.3;
  const scale = isSelected ? selectedScale : hovered ? hoverScale : baseScale;
  
  // 只在选中或悬停时动画，提升性能
  useFrame((_, delta) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.rotation.x += delta * 1.5;
      meshRef.current.rotation.y += delta * 1;
    }
  });

  if (!entity.position) return null;

  return (
    <Float speed={hovered || isSelected ? 3 : 1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group position={[entity.position.x, entity.position.y, entity.position.z]}>
        {/* 发光效果 - 只有选中或悬停时显示，提升性能 */}
        {(hovered || isSelected) && (
          <mesh>
            <sphereGeometry args={[0.5 * scale, 16, 16]} />
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
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 2.5 : hovered ? 1.5 : 0.4}
            roughness={0.15}
            metalness={0.85}
          />
        </mesh>

        {/* 标签 */}
        <Html distanceFactor={16}>
          <div
            className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all duration-200 pointer-events-none ${
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
      </group>
    </Float>
  );
};

interface GraphLineProps {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  color: string;
  highlighted: boolean;
}

const GraphLine: React.FC<GraphLineProps> = ({ start, end, color, highlighted }) => {
  const points = useMemo(() => [
    new THREE.Vector3(start.x, start.y, start.z), 
    new THREE.Vector3(end.x, end.y, end.z)
  ], [start, end]);

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

export default Graph3D;
