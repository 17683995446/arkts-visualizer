import { create } from 'zustand';
import { Entity, Relationship, GraphData, Statistics, EntityType } from '@/types';
import { generateMockData, generateLargeMockData, generateHugeMockData, generateExtremeMockData, generateChaosTestData, generateRealisticArkTSData, generateUltimateChaosData } from '@/lib/mockData';
import { logger } from '@/utils/debugLogger';

interface GraphStore {
  graphData: GraphData;
  selectedEntity: Entity | null;
  visibleEntityTypes: EntityType[];
  searchQuery: string;
  statistics: Statistics;
  isLoading: boolean;
  useLargeDataset: boolean;
  useHugeDataset: boolean;
  useExtremeDataset: boolean;
  useChaosDataset: boolean;
  useRealisticDataset: boolean;
  useUltimateChaosDataset: boolean;
  
  setGraphData: (data: GraphData) => void;
  selectEntity: (entity: Entity | null) => void;
  toggleEntityTypeVisibility: (type: EntityType) => void;
  setSearchQuery: (query: string) => void;
  loadMockData: () => void;
  loadLargeMockData: () => void;
  loadHugeMockData: () => void;
  loadExtremeMockData: () => void;
  loadChaosTestData: () => void;
  loadRealisticArkTSData: () => void;
  loadUltimateChaosData: () => void;
  toggleDatasetSize: () => void;
  calculateStatistics: () => void;
}

const INITIAL_VISIBLE_TYPES: EntityType[] = ['File', 'Class', 'Component', 'Method', 'Field', 'StateVariable'];

export const useGraphStore = create<GraphStore>((set, get) => ({
  graphData: { entities: [], relationships: [] },
  selectedEntity: null,
  visibleEntityTypes: INITIAL_VISIBLE_TYPES,
  searchQuery: '',
  statistics: {
    totalEntities: 0,
    totalRelationships: 0,
    entityTypeCounts: {
      File: 0,
      Class: 0,
      Component: 0,
      Method: 0,
      Field: 0,
      StateVariable: 0,
    },
    relationshipTypeCounts: {},
  },
  isLoading: false,
  useLargeDataset: false,
  useHugeDataset: false,
  useExtremeDataset: false,
  useChaosDataset: false,
  useRealisticDataset: false,
  useUltimateChaosDataset: false,

  setGraphData: (data: GraphData) => {
    logger.info('setGraphData() called', { 
      hasData: !!data, 
      entityCount: data?.entities?.length, 
      relCount: data?.relationships?.length 
    });
    
    if (!data || !Array.isArray(data.entities) || !Array.isArray(data.relationships)) {
      logger.error('Invalid graph data provided', { data });
      return;
    }
    
    set({ graphData: data, selectedEntity: null });
    get().calculateStatistics();
    logger.info('setGraphData() completed successfully');
  },

  selectEntity: (entity: Entity | null) => {
    if (!entity) {
      set({ selectedEntity: null });
      return;
    }
    
    if (!entity.id || !entity.type || !entity.name) {
      logger.error('Invalid entity selected');
      return;
    }
    
    set({ selectedEntity: entity });
  },

  toggleEntityTypeVisibility: (type: EntityType) => {
    set((state) => {
      const isVisible = state.visibleEntityTypes.includes(type);
      return {
        visibleEntityTypes: isVisible
          ? state.visibleEntityTypes.filter(t => t !== type)
          : [...state.visibleEntityTypes, type],
      };
    });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  loadMockData: () => {
    try {
      set({ isLoading: true, selectedEntity: null });
      const data = generateMockData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate mock data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: false, useExtremeDataset: false, useChaosDataset: false, useRealisticDataset: false, useUltimateChaosDataset: false });
      get().calculateStatistics();
    } catch (error) {
      logger.error('Error loading mock data:', error);
      set({ isLoading: false });
    }
  },

  loadLargeMockData: () => {
    try {
      set({ isLoading: true, selectedEntity: null });
      const data = generateLargeMockData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate large mock data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: true, useHugeDataset: false, useExtremeDataset: false, useChaosDataset: false, useRealisticDataset: false, useUltimateChaosDataset: false });
      get().calculateStatistics();
    } catch (error) {
      logger.error('Error loading large mock data:', error);
      set({ isLoading: false });
    }
  },

  loadHugeMockData: () => {
    try {
      set({ isLoading: true, selectedEntity: null });
      const data = generateHugeMockData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate huge mock data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: true, useExtremeDataset: false, useChaosDataset: false, useRealisticDataset: false, useUltimateChaosDataset: false });
      get().calculateStatistics();
    } catch (error) {
      logger.error('Error loading huge mock data:', error);
      set({ isLoading: false });
    }
  },

  loadExtremeMockData: () => {
    try {
      set({ isLoading: true, selectedEntity: null });
      const data = generateExtremeMockData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate extreme mock data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: false, useExtremeDataset: true, useChaosDataset: false, useRealisticDataset: false, useUltimateChaosDataset: false });
      get().calculateStatistics();
    } catch (error) {
      logger.error('Error loading extreme mock data:', error);
      set({ isLoading: false });
    }
  },

  loadChaosTestData: () => {
    try {
      logger.warn('⚠️ Loading CHAOS test data - expect errors!');
      set({ isLoading: true, selectedEntity: null });
      const data = generateChaosTestData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate chaos test data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: false, useExtremeDataset: false, useChaosDataset: true, useRealisticDataset: false, useUltimateChaosDataset: false });
      get().calculateStatistics();
    } catch (error) {
      logger.error('💥 Chaos test failed - error:', error);
      set({ isLoading: false });
    }
  },

  loadRealisticArkTSData: () => {
    try {
      logger.info('🎯 Loading REALISTIC ArkTS enterprise application data...');
      set({ isLoading: true, selectedEntity: null });
      const data = generateRealisticArkTSData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate realistic ArkTS data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: false, useExtremeDataset: false, useChaosDataset: false, useRealisticDataset: true, useUltimateChaosDataset: false });
      get().calculateStatistics();
      logger.info('🎯 Realistic ArkTS data loaded successfully');
    } catch (error) {
      logger.error('💥 Realistic ArkTS data generation failed - error:', error);
      set({ isLoading: false });
    }
  },

  loadUltimateChaosData: () => {
    try {
      logger.error('💥💥💥 LOADING ULTIMATE CHAOS DATA - BRACE FOR IMPACT 💥💥💥');
      set({ isLoading: true, selectedEntity: null });
      const data = generateUltimateChaosData();
      if (!data || !data.entities || !data.relationships) {
        throw new Error('Failed to generate ultimate chaos data');
      }
      set({ graphData: data, isLoading: false, useLargeDataset: false, useHugeDataset: false, useExtremeDataset: false, useChaosDataset: false, useRealisticDataset: false, useUltimateChaosDataset: true });
      get().calculateStatistics();
      logger.info('💥💥💥 ULTIMATE CHAOS DATA LOADED - SYSTEM SURVIVED 💥💥💥');
    } catch (error) {
      logger.error('💥💥💥 ULTIMATE CHAOS CRASHED AND BURNED - error:', error);
      set({ isLoading: false });
    }
  },

  calculateStatistics: () => {
    const { graphData } = get();
    
    if (!graphData || !graphData.entities || !graphData.relationships) {
      logger.error('Invalid graph data for statistics calculation');
      return;
    }
    
    const entityTypeCounts = {
      File: 0,
      Class: 0,
      Component: 0,
      Method: 0,
      Field: 0,
      StateVariable: 0,
    };
    
    const relationshipTypeCounts: Record<string, number> = {};
    
    graphData.entities.forEach(entity => {
      if (entity && entity.type && entity.type in entityTypeCounts) {
        entityTypeCounts[entity.type]++;
      }
    });

    graphData.relationships.forEach(rel => {
      if (rel && rel.type) {
        relationshipTypeCounts[rel.type] = (relationshipTypeCounts[rel.type] || 0) + 1;
      }
    });

    set({
      statistics: {
        totalEntities: graphData.entities.length,
        totalRelationships: graphData.relationships.length,
        entityTypeCounts,
        relationshipTypeCounts,
      },
    });
  },

  toggleDatasetSize: () => {
    const { 
      useLargeDataset, 
      useHugeDataset, 
      useExtremeDataset, 
      useChaosDataset,
      useRealisticDataset,
      useUltimateChaosDataset,
      loadMockData, 
      loadLargeMockData, 
      loadHugeMockData, 
      loadExtremeMockData 
    } = get();
    
    logger.debug('toggleDatasetSize called', {
      useLargeDataset, 
      useHugeDataset, 
      useExtremeDataset, 
      useChaosDataset,
      useRealisticDataset,
      useUltimateChaosDataset
    });
    
    // 如果是在任何特殊模式，都先回到 Small
    if (useChaosDataset || useRealisticDataset || useUltimateChaosDataset) {
      logger.info('Exiting special mode, switching to Small dataset');
      loadMockData();
    } else if (useExtremeDataset) {
      logger.info('Switching Extreme -> Small');
      loadMockData();
    } else if (useHugeDataset) {
      logger.info('Switching Huge -> Extreme');
      loadExtremeMockData();
    } else if (useLargeDataset) {
      logger.info('Switching Large -> Huge');
      loadHugeMockData();
    } else {
      logger.info('Switching Small -> Large');
      loadLargeMockData();
    }
  },
}));
