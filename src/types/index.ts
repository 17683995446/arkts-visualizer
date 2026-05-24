export type EntityType = 'File' | 'Class' | 'Component' | 'Method' | 'Field' | 'StateVariable';

export type RelationshipType = 
  | 'CONTAINS'
  | 'CALLS'
  | 'HAS_STATE'
  | 'IMPORTS'
  | 'EXTENDS'
  | 'IMPLEMENTS'
  | 'DEPENDS_ON'
  | 'REFERENCES'
  | 'USES'
  | string;

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface EntityProperty {
  [key: string]: any;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  fullName: string;
  filePath?: string;
  properties: EntityProperty;
  position?: Position;
}

export interface RelationshipProperty {
  [key: string]: any;
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  sourceId: string;
  targetId: string;
  properties: RelationshipProperty;
}

export interface GraphData {
  entities: Entity[];
  relationships: Relationship[];
}

export interface EntityTypeCount {
  File: number;
  Class: number;
  Component: number;
  Method: number;
  Field: number;
  StateVariable: number;
}

export interface Statistics {
  totalEntities: number;
  totalRelationships: number;
  entityTypeCounts: EntityTypeCount;
  relationshipTypeCounts: Record<RelationshipType, number>;
}

export interface GraphConfig {
  maxEntities?: number;
  maxRelationships?: number;
  enableCaching?: boolean;
  renderDistance?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface ViewportState {
  cameraPosition: Position;
  zoom: number;
  isRotating: boolean;
  isPanning: boolean;
}
