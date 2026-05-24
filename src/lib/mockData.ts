import { Entity, Relationship, GraphData, EntityType, EntityProperty, RelationshipProperty } from '@/types';
import { logger } from '@/utils/debugLogger';

let idCounter = 0;

function generateId(): string {
  idCounter++;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  const result = `${timestamp}-${random}-${idCounter}`;
  return result;
}

function validateEntityName(name: string): string {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    logger.warn('Invalid entity name, using default', { name });
    return 'UnnamedEntity';
  }
  
  const result = name.substring(0, 100);
  return result;
}

function validateFullName(fullName: string): string {
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
    logger.warn('Invalid fullName, using default', { fullName });
    return 'unknown::unknown';
  }
  
  const result = fullName.substring(0, 200);
  return result;
}

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  File: '#00E5FF',
  Class: '#9D4EDD',
  Component: '#39FF14',
  Method: '#FF006E',
  Field: '#FFD60A',
  StateVariable: '#FF6B35',
};

export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  File: 'file',
  Class: 'class',
  Component: 'component',
  Method: 'method',
  Field: 'field',
  StateVariable: 'state',
};

function createEntity(
  type: EntityType, 
  name: string, 
  fullName: string, 
  filePath?: string, 
  properties: EntityProperty = {}
): Entity {
  const result = {
    id: generateId(),
    type,
    name: validateEntityName(name),
    fullName: validateFullName(fullName),
    filePath: filePath || undefined,
    properties,
  };
  
  return result;
}

function createRelationship(
  type: string, 
  sourceId: string, 
  targetId: string, 
  properties: RelationshipProperty = {}
): Relationship {
  if (!sourceId || !targetId) {
    const error = new Error('Invalid relationship: sourceId and targetId are required');
    logger.error('createRelationship() failed', { sourceId, targetId, error: error.message });
    throw error;
  }
  
  const result = {
    id: generateId(),
    type: type || 'REFERENCES',
    sourceId,
    targetId,
    properties,
  };
  
  return result;
}

// 🚀 极限超大数据集 - 10000+ 实体，20000+ 关系（极端压力测试）
export function generateExtremeMockData(): GraphData {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const allEntities: Entity[] = [];
  
  // 创建 100 个文件
  const fileCount = 100;
  
  for (let fileIndex = 0; fileIndex < fileCount; fileIndex++) {
    const fileName = `File${fileIndex + 1}.tsx`;
    const file = createEntity('File', fileName, `src/modules/${fileName}`, `src/modules/${fileName}`, {
      path: `src/modules/${fileName}`,
      language: 'TypeScript',
      size: Math.floor(Math.random() * 50000) + 5000,
    });
    entities.push(file);
    allEntities.push(file);
    
    // 每个文件创建 5-15 个组件
    const componentCount = Math.floor(Math.random() * 11) + 5;
    for (let c = 0; c < componentCount; c++) {
      const componentName = `${fileName.replace('.tsx', '')}Component${c}`;
      const component = createEntity(
        'Component', 
        componentName, 
        `${file.fullName}::${componentName}`,
        file.filePath,
        { isEntry: fileIndex === 0 && c === 0, decorator: '@Component' }
      );
      entities.push(component);
      allEntities.push(component);
      relationships.push(createRelationship('CONTAINS', file.id, component.id));
      
      // 每个组件创建 5-12 个状态变量
      const stateVarNames = ['count', 'name', 'data', 'loading', 'error', 'theme', 'config', 'isOpen', 'selected', 'active', 'hovered', 'focused'];
      const stateVarCount = Math.floor(Math.random() * 8) + 5;
      for (let s = 0; s < stateVarCount; s++) {
        const stateVar = createEntity(
          'StateVariable',
          stateVarNames[s % stateVarNames.length] + s,
          `${component.fullName}::${stateVarNames[s % stateVarNames.length]}${s}`,
          file.filePath,
          { componentName: component.name, decorator: '@State', type: s % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(stateVar);
        allEntities.push(stateVar);
        relationships.push(createRelationship('HAS_STATE', component.id, stateVar.id));
      }
      
      // 每个组件创建 8-20 个方法
      const methodNames = ['build', 'onMount', 'onDestroy', 'handleClick', 'update', 'fetchData', 'validate', 'reset', 'format', 'parse', 'transform', 'save', 'load', 'initialize', 'shutdown', 'refresh', 'clear', 'sync'];
      const methodCount = Math.floor(Math.random() * 13) + 8;
      const componentMethods: Entity[] = [];
      
      for (let m = 0; m < methodCount; m++) {
        const method = createEntity(
          'Method',
          methodNames[m % methodNames.length] + m,
          `${component.fullName}::${methodNames[m % methodNames.length]}${m}`,
          file.filePath,
          { className: component.name, returnType: 'void' }
        );
        entities.push(method);
        allEntities.push(method);
        componentMethods.push(method);
        relationships.push(createRelationship('CONTAINS', component.id, method.id));
      }
      
      // 方法间的大量调用关系
      if (componentMethods.length > 3) {
        for (let i = 0; i < componentMethods.length; i++) {
          for (let j = 0; j < Math.floor(componentMethods.length / 2); j++) {
            if (i !== j) {
              relationships.push(createRelationship('CALLS', componentMethods[i].id, componentMethods[j % componentMethods.length].id));
            }
          }
        }
      }
    }
    
    // 每个文件创建 3-10 个类
    const classNames = ['DataModel', 'ApiService', 'Helper', 'Validator', 'Store', 'Controller', 'Repository', 'Adapter', 'Factory', 'Provider'];
    const classCount = Math.floor(Math.random() * 8) + 3;
    for (let cl = 0; cl < classCount; cl++) {
      const cls = createEntity(
        'Class',
        `${classNames[cl % classNames.length]}${fileIndex}_${cl}`,
        `${file.fullName}::${classNames[cl % classNames.length]}${fileIndex}_${cl}`,
        file.filePath,
        { modifiers: ['export'] }
      );
      entities.push(cls);
      allEntities.push(cls);
      relationships.push(createRelationship('CONTAINS', file.id, cls.id));
      
      // 每个类创建 4-12 个字段
      const fieldNames = ['id', 'name', 'data', 'count', 'version', 'status', 'timestamp', 'config', 'options', 'settings', 'cache', 'history'];
      const fieldCount = Math.floor(Math.random() * 9) + 4;
      for (let f = 0; f < fieldCount; f++) {
        const field = createEntity(
          'Field',
          fieldNames[f % fieldNames.length] + f,
          `${cls.fullName}::${fieldNames[f % fieldNames.length]}${f}`,
          file.filePath,
          { className: cls.name, type: f % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(field);
        allEntities.push(field);
        relationships.push(createRelationship('CONTAINS', cls.id, field.id));
      }
      
      // 每个类创建 5-15 个方法
      const classMethodNames = ['init', 'get', 'set', 'save', 'load', 'clear', 'update', 'delete', 'fetch', 'sync', 'validate', 'transform', 'serialize', 'deserialize', 'reset'];
      const classMethodCount = Math.floor(Math.random() * 11) + 5;
      for (let cm = 0; cm < classMethodCount; cm++) {
        const method = createEntity(
          'Method',
          classMethodNames[cm % classMethodNames.length] + cm,
          `${cls.fullName}::${classMethodNames[cm % classMethodNames.length]}${cm}`,
          file.filePath,
          { className: cls.name, returnType: cm % 2 === 0 ? 'void' : 'object' }
        );
        entities.push(method);
        allEntities.push(method);
        relationships.push(createRelationship('CONTAINS', cls.id, method.id));
      }
    }
  }
  
  // 随机生成大量跨文件关系
  const crossFileRelationshipCount = 5000;
  for (let i = 0; i < crossFileRelationshipCount; i++) {
    const sourceIdx = Math.floor(Math.random() * allEntities.length);
    const targetIdx = Math.floor(Math.random() * allEntities.length);
    if (sourceIdx !== targetIdx && allEntities[sourceIdx].id && allEntities[targetIdx].id) {
      const relTypes = ['IMPORTS', 'CALLS', 'REFERENCES', 'DEPENDS_ON', 'USES'];
      relationships.push(createRelationship(
        relTypes[Math.floor(Math.random() * relTypes.length)],
        allEntities[sourceIdx].id,
        allEntities[targetIdx].id
      ));
    }
  }
  
  // 为实体分配 3D 位置
  assignPositions(entities);
  
  logger.info('🚀 极限超大数据集生成完成', { entityCount: entities.length, relationshipCount: relationships.length });
  
  return { entities, relationships };
}

// 🌟 超级大数据集 - 1000+ 实体，1500+ 关系
export function generateHugeMockData(): GraphData {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const allMethods: Entity[] = [];
  
  // 创建 20 个文件
  const fileNames = [
    'Index.tsx', 'Home.tsx', 'Profile.tsx', 'Settings.tsx', 'Dashboard.tsx',
    'Components.tsx', 'Utils.ts', 'Api.ts', 'Models.ts', 'Store.ts',
    'Services.ts', 'Hooks.ts', 'Types.ts', 'Constants.ts', 'Validators.ts',
    'Chart.tsx', 'Table.tsx', 'Form.tsx', 'Modal.tsx', 'Auth.tsx'
  ];
  
  const files: Entity[] = [];
  
  fileNames.forEach((fileName, fileIndex) => {
    const file = createEntity('File', fileName, `src/${fileName}`, `src/${fileName}`, {
      path: `src/${fileName}`,
      language: 'TypeScript',
      size: Math.floor(Math.random() * 10000) + 1000,
    });
    files.push(file);
    entities.push(file);
    
    // 每个文件创建 2-6 个组件
    const componentCount = Math.floor(Math.random() * 5) + 2;
    for (let c = 0; c < componentCount; c++) {
      const componentName = `${fileName.replace('.tsx', '').replace('.ts', '')}${c === 0 ? '' : `Component${c}`}`;
      const component = createEntity(
        'Component', 
        componentName, 
        `${file.fullName}::${componentName}`,
        file.filePath,
        { isEntry: fileIndex === 0 && c === 0, decorator: '@Component' }
      );
      entities.push(component);
      relationships.push(createRelationship('CONTAINS', file.id, component.id));
      
      // 每个组件创建 3-8 个状态变量
      const stateVarNames = ['count', 'name', 'data', 'loading', 'error', 'theme', 'config', 'isOpen', 'selected'];
      const stateVarCount = Math.floor(Math.random() * 6) + 3;
      for (let s = 0; s < stateVarCount; s++) {
        const stateVar = createEntity(
          'StateVariable',
          stateVarNames[s % stateVarNames.length],
          `${component.fullName}::${stateVarNames[s % stateVarNames.length]}`,
          file.filePath,
          { componentName: component.name, decorator: '@State', type: s % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(stateVar);
        relationships.push(createRelationship('HAS_STATE', component.id, stateVar.id));
      }
      
      // 每个组件创建 5-15 个方法
      const methodNames = [
        'build', 'onMount', 'onDestroy', 'handleClick', 'update', 'fetchData', 
        'validate', 'reset', 'format', 'parse', 'transform', 'save', 'load'
      ];
      const methodCount = Math.floor(Math.random() * 11) + 5;
      const componentMethods: Entity[] = [];
      
      for (let m = 0; m < methodCount; m++) {
        const method = createEntity(
          'Method',
          methodNames[m % methodNames.length],
          `${component.fullName}::${methodNames[m % methodNames.length]}`,
          file.filePath,
          { className: component.name, returnType: 'void' }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', component.id, method.id));
        componentMethods.push(method);
        allMethods.push(method);
      }
      
      // 方法之间的调用关系
      if (componentMethods.length > 2) {
        for (let i = 1; i < componentMethods.length; i++) {
          relationships.push(createRelationship('CALLS', componentMethods[i].id, componentMethods[Math.floor(Math.random() * i)].id));
        }
      }
    }
    
    // 每个文件创建 1-3 个类
    const classNames = ['DataModel', 'ApiService', 'Helper', 'Validator', 'Store', 'Controller'];
    const classCount = Math.floor(Math.random() * 3) + 1;
    
    for (let cl = 0; cl < classCount; cl++) {
      const cls = createEntity(
        'Class',
        `${classNames[cl % classNames.length]}${fileIndex}`,
        `${file.fullName}::${classNames[cl % classNames.length]}${fileIndex}`,
        file.filePath,
        { modifiers: ['export'] }
      );
      entities.push(cls);
      relationships.push(createRelationship('CONTAINS', file.id, cls.id));
      
      // 每个类创建 3-6 个字段
      const fieldNames = ['id', 'name', 'data', 'count', 'version', 'status', 'timestamp'];
      const fieldCount = Math.floor(Math.random() * 4) + 3;
      for (let f = 0; f < fieldCount; f++) {
        const field = createEntity(
          'Field',
          fieldNames[f % fieldNames.length],
          `${cls.fullName}::${fieldNames[f % fieldNames.length]}`,
          file.filePath,
          { className: cls.name, type: f % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(field);
        relationships.push(createRelationship('CONTAINS', cls.id, field.id));
      }
      
      // 每个类创建 4-8 个方法
      const classMethodNames = ['init', 'get', 'set', 'save', 'load', 'clear', 'update', 'delete'];
      const classMethodCount = Math.floor(Math.random() * 5) + 4;
      const classMethods: Entity[] = [];
      
      for (let cm = 0; cm < classMethodCount; cm++) {
        const method = createEntity(
          'Method',
          classMethodNames[cm % classMethodNames.length],
          `${cls.fullName}::${classMethodNames[cm % classMethodNames.length]}`,
          file.filePath,
          { className: cls.name, returnType: cm % 2 === 0 ? 'void' : 'object' }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', cls.id, method.id));
        classMethods.push(method);
        allMethods.push(method);
      }
    }
  });
  
  // 创建跨文件导入关系
  for (let i = 0; i < files.length - 1; i++) {
    for (let j = i + 1; j < files.length; j++) {
      if (Math.random() > 0.5) {
        relationships.push(createRelationship('IMPORTS', files[i].id, files[j].id));
      }
      if (Math.random() > 0.7) {
        relationships.push(createRelationship('IMPORTS', files[j].id, files[i].id));
      }
    }
  }
  
  // 创建大量跨文件方法调用关系
  for (let i = 0; i < 100; i++) {
    const sourceIdx = Math.floor(Math.random() * allMethods.length);
    const targetIdx = Math.floor(Math.random() * allMethods.length);
    if (sourceIdx !== targetIdx) {
      relationships.push(createRelationship('CALLS', allMethods[sourceIdx].id, allMethods[targetIdx].id));
    }
  }
  
  // 为实体分配 3D 位置
  assignPositions(entities);
  
  logger.info('🎉 超级大数据集创建完成', { entityCount: entities.length, relationshipCount: relationships.length });
  
  return { entities, relationships };
}

function assignPositions(entities: Entity[]): void {
  logger.debug('assignPositions() called', { entityCount: entities.length });
  
  const positionMap: Record<string, { x: number; y: number; z: number }> = {};
  
  const typeGroups: Record<EntityType, Entity[]> = {
    File: [], Class: [], Component: [], Method: [], Field: [], StateVariable: []
  };
  
  entities.forEach(entity => {
    if (typeGroups[entity.type]) {
      typeGroups[entity.type].push(entity);
    } else {
      logger.warn('Unknown entity type for position assignment', { type: entity.type });
    }
  });
  
  let groupIndex = 0;
  const groupRadius = 12;
  
  Object.entries(typeGroups).forEach(([type, typeEntities]) => {
    if (typeEntities.length > 0) {
      const groupAngle = (groupIndex / Object.keys(typeGroups).length) * Math.PI * 2;
      
      typeEntities.forEach((entity, index) => {
        const angle = (index / typeEntities.length) * Math.PI * 2;
        const radius = groupRadius + (Math.random() - 0.5) * 6;
        const height = (Math.random() - 0.5) * 10;
        
        positionMap[entity.id] = {
          x: Math.cos(groupAngle) * groupRadius + Math.cos(angle) * radius,
          y: height,
          z: Math.sin(groupAngle) * groupRadius + Math.sin(angle) * radius,
        };
      });
      
      groupIndex++;
    }
  });
  
  let positionsAssigned = 0;
  entities.forEach(entity => {
    if (positionMap[entity.id]) {
      entity.position = positionMap[entity.id];
      positionsAssigned++;
    }
  });
  
  logger.debug('assignPositions() completed', { 
    totalEntities: entities.length, 
    positionsAssigned 
  });
}

// 大数据集 - 200+ 实体
export function generateLargeMockData(): GraphData {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  
  const fileNames = ['Index.ets', 'Home.ets', 'Profile.ets', 'Settings.ets', 'Components.ets', 'Utils.ets', 'Api.ets', 'Models.ets'];
  const files: Entity[] = [];
  
  fileNames.forEach((fileName, index) => {
    const file = createEntity('File', fileName, `src/${fileName}`, `src/${fileName}`, {
      path: `src/${fileName}`,
      language: 'ArkTS',
      size: Math.floor(Math.random() * 5000) + 1000,
    });
    files.push(file);
    entities.push(file);
  });
  
  files.forEach((file) => {
    const isEntry = file.name === 'Index.ets';
    const componentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < componentCount; i++) {
      const componentName = `${file.name.replace('.ets', '')}${i === 0 ? '' : `Component${i}`}`;
      const component = createEntity(
        'Component', 
        componentName, 
        `${file.fullName}::${componentName}`,
        file.filePath,
        { isEntry: isEntry && i === 0, decorator: '@Component' }
      );
      entities.push(component);
      relationships.push(createRelationship('CONTAINS', file.id, component.id));
      
      const stateVarNames = ['count', 'name', 'data', 'loading', 'error', 'theme', 'config'];
      const stateVarCount = Math.floor(Math.random() * 5) + 2;
      for (let s = 0; s < stateVarCount; s++) {
        const stateVar = createEntity(
          'StateVariable',
          stateVarNames[s % stateVarNames.length],
          `${component.fullName}::${stateVarNames[s % stateVarNames.length]}`,
          file.filePath,
          { componentName: component.name, decorator: '@State', type: s % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(stateVar);
        relationships.push(createRelationship('HAS_STATE', component.id, stateVar.id));
      }
      
      const methodNames = ['build', 'onMount', 'onDestroy', 'handleClick', 'update', 'fetchData', 'validate', 'reset'];
      const methodCount = Math.floor(Math.random() * 4) + 3;
      const methods: Entity[] = [];
      
      for (let m = 0; m < methodCount; m++) {
        const method = createEntity(
          'Method',
          methodNames[m % methodNames.length],
          `${component.fullName}::${methodNames[m % methodNames.length]}`,
          file.filePath,
          { className: component.name, returnType: 'void' }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', component.id, method.id));
        methods.push(method);
      }
      
      if (methods.length > 1) {
        for (let j = 1; j < methods.length; j++) {
          relationships.push(createRelationship('CALLS', methods[j].id, methods[Math.floor(Math.random() * j)].id));
        }
      }
    }
    
    const classNames = ['DataModel', 'ApiService', 'Helper', 'Validator', 'Storage', 'ConfigManager'];
    const classCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < classCount; i++) {
      const cls = createEntity(
        'Class',
        `${classNames[i % classNames.length]}${i > 0 ? i : ''}`,
        `${file.fullName}::${classNames[i % classNames.length]}${i > 0 ? i : ''}`,
        file.filePath,
        { modifiers: ['export'] }
      );
      entities.push(cls);
      relationships.push(createRelationship('CONTAINS', file.id, cls.id));
      
      const fieldCount = Math.floor(Math.random() * 3) + 2;
      const fieldNames = ['id', 'name', 'data', 'count', 'version', 'status'];
      for (let f = 0; f < fieldCount; f++) {
        const field = createEntity(
          'Field',
          fieldNames[f % fieldNames.length],
          `${cls.fullName}::${fieldNames[f % fieldNames.length]}`,
          file.filePath,
          { className: cls.name, type: f % 2 === 0 ? 'string' : 'number' }
        );
        entities.push(field);
        relationships.push(createRelationship('CONTAINS', cls.id, field.id));
      }
      
      const classMethodCount = Math.floor(Math.random() * 3) + 2;
      const classMethodNames = ['init', 'get', 'set', 'save', 'load', 'clear'];
      for (let m = 0; m < classMethodCount; m++) {
        const method = createEntity(
          'Method',
          classMethodNames[m % classMethodNames.length],
          `${cls.fullName}::${classMethodNames[m % classMethodNames.length]}`,
          file.filePath,
          { className: cls.name, returnType: m % 2 === 0 ? 'void' : 'object' }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', cls.id, method.id));
      }
    }
  });
  
  for (let i = 0; i < files.length - 1; i++) {
    relationships.push(createRelationship('IMPORTS', files[i].id, files[i + 1].id));
  }
  
  const allMethods = entities.filter(e => e.type === 'Method');
  for (let i = 0; i < 8; i++) {
    if (allMethods.length > i + 1) {
      relationships.push(createRelationship('CALLS', allMethods[i].id, allMethods[Math.min(i + 1, allMethods.length - 1)].id));
    }
  }
  
  assignPositions(entities);
  
  return { entities, relationships };
}

export function generateMockData(): GraphData {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];

  const file1 = createEntity('File', 'Index.ets', 'src/Index.ets', 'src/Index.ets', { path: 'src/Index.ets', language: 'ArkTS' });
  const file2 = createEntity('File', 'Utils.ets', 'src/Utils.ets', 'src/Utils.ets', { path: 'src/Utils.ets', language: 'ArkTS' });
  entities.push(file1, file2);

  const indexComponent = createEntity('Component', 'Index', `${file1.fullName}::Index`, file1.filePath, { isEntry: true, decorator: '@Entry @Component' });
  entities.push(indexComponent);
  relationships.push(createRelationship('CONTAINS', file1.id, indexComponent.id));

  const state1 = createEntity('StateVariable', 'message', `${indexComponent.fullName}::message`, file1.filePath, { componentName: 'Index', decorator: '@State', type: 'string' });
  const state2 = createEntity('StateVariable', 'count', `${indexComponent.fullName}::count`, file1.filePath, { componentName: 'Index', decorator: '@State', type: 'number' });
  entities.push(state1, state2);
  relationships.push(createRelationship('HAS_STATE', indexComponent.id, state1.id));
  relationships.push(createRelationship('HAS_STATE', indexComponent.id, state2.id));

  const buildMethod = createEntity('Method', 'build', `${indexComponent.fullName}::build`, file1.filePath, { className: 'Index', returnType: 'void' });
  const incrementMethod = createEntity('Method', 'incrementCount', `${indexComponent.fullName}::incrementCount`, file1.filePath, { className: 'Index', returnType: 'void' });
  const updateMethod = createEntity('Method', 'updateMessage', `${indexComponent.fullName}::updateMessage`, file1.filePath, { className: 'Index', returnType: 'void' });
  entities.push(buildMethod, incrementMethod, updateMethod);
  relationships.push(createRelationship('CONTAINS', indexComponent.id, buildMethod.id));
  relationships.push(createRelationship('CONTAINS', indexComponent.id, incrementMethod.id));
  relationships.push(createRelationship('CONTAINS', indexComponent.id, updateMethod.id));

  relationships.push(createRelationship('CALLS', incrementMethod.id, updateMethod.id));

  const utilsClass = createEntity('Class', 'DataHelper', `${file2.fullName}::DataHelper`, file2.filePath, { modifiers: ['export'] });
  entities.push(utilsClass);
  relationships.push(createRelationship('CONTAINS', file2.id, utilsClass.id));

  const field1 = createEntity('Field', 'version', `${utilsClass.fullName}::version`, file2.filePath, { className: 'DataHelper', type: 'string' });
  const method1 = createEntity('Method', 'formatData', `${utilsClass.fullName}::formatData`, file2.filePath, { className: 'DataHelper', returnType: 'string' });
  const method2 = createEntity('Method', 'validate', `${utilsClass.fullName}::validate`, file2.filePath, { className: 'DataHelper', returnType: 'boolean' });
  entities.push(field1, method1, method2);
  relationships.push(createRelationship('CONTAINS', utilsClass.id, field1.id));
  relationships.push(createRelationship('CONTAINS', utilsClass.id, method1.id));
  relationships.push(createRelationship('CONTAINS', utilsClass.id, method2.id));

  relationships.push(createRelationship('IMPORTS', file1.id, file2.id));

  assignPositions(entities);

  return { entities, relationships };
}

// 🌀 极端混乱场景 - 包含各种边界情况和压力测试
export function generateChaosTestData(): GraphData {
  logger.warn('⚠️ Generating chaos test data - expect edge cases!');
  
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const validEntityMap = new Map<string, Entity>();
  
  const startTime = Date.now();
  
  // 1. 正常数据：10个文件
  for (let i = 0; i < 10; i++) {
    const file = createEntity('File', `NormalFile${i}.ts`, `src/normal/NormalFile${i}.ts`, `src/normal/NormalFile${i}.ts`);
    entities.push(file);
    validEntityMap.set(file.id, file);
    
    // 每个文件有正常组件
    const component = createEntity(
      'Component', 
      `NormalComponent${i}`, 
      `${file.fullName}::NormalComponent${i}`, 
      file.filePath
    );
    entities.push(component);
    validEntityMap.set(component.id, component);
    relationships.push(createRelationship('CONTAINS', file.id, component.id));
  }
  
  // 2. 极端情况1：超长名称
  const veryLongName = 'ThisIsAnExtremelyLongEntityNameThatShouldBeClampedDownToPreventOverflowAndPerformanceIssuesWhenRenderingItInThe3DSceneAndInTheLabels';
  const veryLongEntity = createEntity('Class', veryLongName, `LongNames::${veryLongName}::Nested::Deep::Structure`);
  entities.push(veryLongEntity);
  validEntityMap.set(veryLongEntity.id, veryLongEntity);
  
  // 3. 极端情况2：空/异常值 - 使用类型断言绕过部分验证
  // @ts-ignore - 强制添加有问题的数据
  const problematicEntity = {
    id: generateId(),
    type: 'File' as EntityType,
    name: '',
    fullName: '',
    filePath: null,
    properties: {
      'empty': '',
      'null': null,
      'undefined': undefined,
      'large': Array(10000).join('x')
    },
    position: {
      x: Infinity,
      y: -Infinity,
      z: NaN
    }
  };
  entities.push(problematicEntity as Entity);
  
  // 4. 极端情况3：循环引用和交叉关系网络
  const validEntityList = Array.from(validEntityMap.values());
  for (let i = 0; i < validEntityList.length; i++) {
    for (let j = 0; j < validEntityList.length; j++) {
      if (i !== j) {
        // 创建随机关系
        const relTypes = ['CALLS', 'IMPORTS', 'DEPENDS_ON', 'USES', 'REFERENCES', 'EXTENDS', 'IMPLEMENTS'];
        relationships.push(createRelationship(
          relTypes[Math.floor(Math.random() * relTypes.length)],
          validEntityList[i].id,
          validEntityList[j].id
        ));
      }
    }
  }
  
  // 5. 极端情况4：引用不存在实体的关系（防御性创建）
  const safeValidEntityList = Array.from(validEntityMap.values());
  for (let i = 0; i < 10; i++) {
    if (safeValidEntityList.length > 0) {
      relationships.push(createRelationship(
        'TEST_REL',
        safeValidEntityList[0].id,
        safeValidEntityList[safeValidEntityList.length - 1].id
      ));
    }
  }
  
  // 6. 极端情况5：相同实体多次重复
  const duplicatesToCreate = 10;
  for (let i = 0; i < duplicatesToCreate; i++) {
    const duplicate = createEntity('Component', `DuplicateComponent`, `Duplicates::DuplicateComponent`);
    entities.push(duplicate);
    validEntityMap.set(duplicate.id, duplicate);
  }
  
  // 7. 极端情况6：没有位置的实体
  for (let i = 0; i < 8; i++) {
    const noPositionEntity = createEntity('Method', `UnpositionedMethod${i}`, `Orphans::UnpositionedMethod${i}`);
    // 确保没有位置
    delete (noPositionEntity as any).position;
    entities.push(noPositionEntity);
    validEntityMap.set(noPositionEntity.id, noPositionEntity);
  }
  
  // 8. 极端情况7：实体属性类型混乱
  const propertyChaosEntity = createEntity('Field', 'ChaosProperty', 'Chaos::ChaosProperty', undefined, {
    'string': 'value',
    'number': 12345,
    'boolean': true,
    'note': 'complex objects not stored to prevent issues'
  });
  entities.push(propertyChaosEntity);
  validEntityMap.set(propertyChaosEntity.id, propertyChaosEntity);
  
  // 9. 极端情况8：大量空关系
  const validEntityArray = Array.from(validEntityMap.values());
  for (let i = 0; i < 50; i++) {
    if (validEntityArray.length > 1) {
      relationships.push(createRelationship(
        'EMPTY_REL',
        validEntityArray[i % validEntityArray.length].id,
        validEntityArray[(i + 1) % validEntityArray.length].id,
        { isEmpty: true, note: null, timestamp: Date.now() }
      ));
    }
  }
  
  // 10. 最后为有效实体分配正常位置
  assignPositions(Array.from(validEntityMap.values()));
  
  const duration = Date.now() - startTime;
  logger.warn(`🌀 Chaos data generated: ${entities.length} entities, ${relationships.length} relationships in ${duration}ms`);
  logger.warn('⚠️ This is designed to stress-test error handling');
  
  return { entities, relationships };
}

// 🎯 真实 ArkTS 企业级应用模拟 - 超大规模复杂场景
export function generateRealisticArkTSData(): GraphData {
  const startTime = Date.now();
  logger.warn('🎯 Generating realistic enterprise ArkTS application simulation...');
  
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const moduleMap = new Map<string, Entity[]>();
  
  // 真实 ArkTS 模块结构
  const modules = [
    {
      name: 'EntryAbility',
      type: 'File',
      path: 'entry/src/main/ets/entryability/EntryAbility.ets',
      components: ['EntryComponent'],
      services: ['ApiService', 'StorageService', 'LogService'],
      models: ['UserModel', 'ConfigModel'],
    },
    {
      name: 'HomePage',
      type: 'File',
      path: 'entry/src/main/ets/pages/HomePage.ets',
      components: ['HomeView', 'BannerComponent', 'CategoryGrid', 'ProductList', 'SearchBar'],
      services: ['ProductService', 'BannerService'],
      models: ['ProductModel', 'BannerModel', 'CategoryModel'],
    },
    {
      name: 'DetailPage',
      type: 'File',
      path: 'entry/src/main/ets/pages/DetailPage.ets',
      components: ['DetailView', 'ImageGallery', 'InfoSection', 'CommentList', 'RelatedProducts'],
      services: ['ProductService', 'CommentService', 'ReviewService'],
      models: ['ProductDetailModel', 'CommentModel', 'ReviewModel'],
    },
    {
      name: 'UserPage',
      type: 'File',
      path: 'entry/src/main/ets/pages/UserPage.ets',
      components: ['UserView', 'ProfileHeader', 'OrderList', 'AddressManager', 'SettingsPanel'],
      services: ['UserService', 'OrderService', 'AddressService'],
      models: ['UserModel', 'OrderModel', 'AddressModel'],
    },
    {
      name: 'CartPage',
      type: 'File',
      path: 'entry/src/main/ets/pages/CartPage.ets',
      components: ['CartView', 'CartItem', 'CartSummary', 'CheckoutButton'],
      services: ['CartService', 'OrderService', 'PaymentService'],
      models: ['CartItemModel', 'OrderModel', 'PaymentModel'],
    },
    {
      name: 'CommonUtils',
      type: 'File',
      path: 'common/src/main/ets/utils/CommonUtils.ets',
      components: [],
      services: ['DateUtils', 'StringUtils', 'NumberUtils', 'ArrayUtils', 'ValidationUtils'],
      models: [],
    },
    {
      name: 'NetworkManager',
      type: 'File',
      path: 'common/src/main/ets/network/NetworkManager.ets',
      components: [],
      services: ['HttpClient', 'WebSocketClient', 'CacheManager'],
      models: ['RequestModel', 'ResponseModel', 'ErrorModel'],
    },
    {
      name: 'DataStore',
      type: 'File',
      path: 'common/src/main/ets/storage/DataStore.ets',
      components: [],
      services: ['PreferencesManager', 'DatabaseManager', 'FileManager'],
      models: ['PreferenceModel', 'DatabaseModel'],
    },
    {
      name: 'Logger',
      type: 'File',
      path: 'common/src/main/ets/logger/Logger.ets',
      components: [],
      services: ['LogManager', 'AnalyticsTracker'],
      models: ['LogModel', 'EventModel'],
    },
    {
      name: 'Router',
      type: 'File',
      path: 'common/src/main/ets/router/Router.ets',
      components: [],
      services: ['RouteManager', 'NavigationService', 'DeepLinkHandler'],
      models: ['RouteModel', 'NavPathModel'],
    },
  ];

  // 创建所有模块
  modules.forEach((mod) => {
    const file = createEntity(
      'File',
      `${mod.name}.ets`,
      mod.path,
      mod.path,
      {
        language: 'ArkTS',
        module: mod.name,
        componentCount: mod.components.length,
        serviceCount: mod.services.length,
        modelCount: mod.models.length,
      }
    );
    entities.push(file);
    
    const fileEntities = [file];
    
    // 创建组件
    mod.components.forEach((compName) => {
      const component = createEntity(
        'Component',
        compName,
        `${mod.path}::${compName}`,
        mod.path,
        {
          decorator: '@Component',
          isEntry: compName.includes('Entry') || compName === 'HomeView',
          stateCount: Math.floor(Math.random() * 8) + 3,
          linkCount: Math.floor(Math.random() * 5) + 2,
        }
      );
      entities.push(component);
      relationships.push(createRelationship('CONTAINS', file.id, component.id));
      
      // 为组件创建状态变量
      const stateNames = ['isLoading', 'data', 'error', 'page', 'pageSize', 'total', 'selected', 'checked', 'expanded'];
      const stateCount = Math.floor(Math.random() * 6) + 3;
      for (let i = 0; i < stateCount; i++) {
        const state = createEntity(
          'StateVariable',
          stateNames[i % stateNames.length],
          `${component.fullName}::${stateNames[i % stateNames.length]}`,
          mod.path,
          {
            type: i % 3 === 0 ? 'boolean' : i % 3 === 1 ? 'string' : 'number',
            componentName: compName,
            decorator: '@State',
          }
        );
        entities.push(state);
        relationships.push(createRelationship('HAS_STATE', component.id, state.id));
      }
      
      // 为组件创建方法
      const methodNames = ['aboutToAppear', 'aboutToDisappear', 'onPageShow', 'onPageHide', 'build', 'refresh', 'loadMore', 'onInit', 'onReady'];
      const methodCount = Math.floor(Math.random() * 7) + 4;
      const methods: Entity[] = [];
      
      for (let i = 0; i < methodCount; i++) {
        const method = createEntity(
          'Method',
          methodNames[i % methodNames.length],
          `${component.fullName}::${methodNames[i % methodNames.length]}`,
          mod.path,
          {
            componentName: compName,
            returnType: 'void',
            isLifecycle: i < 4,
          }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', component.id, method.id));
        methods.push(method);
      }
      
      // 组件间调用关系
      for (let i = 0; i < methods.length; i++) {
        for (let j = i + 1; j < methods.length; j++) {
          if (Math.random() > 0.6) {
            relationships.push(createRelationship('CALLS', methods[i].id, methods[j].id));
          }
        }
      }
      
      fileEntities.push(component);
    });
    
    // 创建服务类
    mod.services.forEach((serviceName) => {
      const service = createEntity(
        'Class',
        serviceName,
        `${mod.path}::${serviceName}`,
        mod.path,
        {
          isService: true,
          decorator: '@Observed',
        }
      );
      entities.push(service);
      relationships.push(createRelationship('CONTAINS', file.id, service.id));
      
      // 服务字段
      const fieldNames = ['baseUrl', 'timeout', 'headers', 'cache', 'instance'];
      const fieldCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < fieldCount; i++) {
        const field = createEntity(
          'Field',
          fieldNames[i % fieldNames.length],
          `${service.fullName}::${fieldNames[i % fieldNames.length]}`,
          mod.path,
          {
            className: serviceName,
            type: i === 0 ? 'string' : i === 1 ? 'number' : 'object',
            isStatic: i === 0,
          }
        );
        entities.push(field);
        relationships.push(createRelationship('CONTAINS', service.id, field.id));
      }
      
      // 服务方法
      const serviceMethods = ['initialize', 'request', 'get', 'post', 'put', 'delete', 'upload', 'download'];
      const methodCount = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < methodCount; i++) {
        const method = createEntity(
          'Method',
          serviceMethods[i % serviceMethods.length],
          `${service.fullName}::${serviceMethods[i % serviceMethods.length]}`,
          mod.path,
          {
            className: serviceName,
            returnType: i < 2 ? 'void' : 'Promise',
          }
        );
        entities.push(method);
        relationships.push(createRelationship('CONTAINS', service.id, method.id));
      }
      
      fileEntities.push(service);
    });
    
    // 创建数据模型
    mod.models.forEach((modelName) => {
      const model = createEntity(
        'Class',
        modelName,
        `${mod.path}::${modelName}`,
        mod.path,
        {
          isModel: true,
          decorator: '@Observed',
        }
      );
      entities.push(model);
      relationships.push(createRelationship('CONTAINS', file.id, model.id));
      
      // 模型字段
      const modelFields = ['id', 'name', 'description', 'createdAt', 'updatedAt', 'status', 'version'];
      const fieldCount = Math.floor(Math.random() * 5) + 3;
      for (let i = 0; i < fieldCount; i++) {
        const field = createEntity(
          'Field',
          modelFields[i % modelFields.length],
          `${model.fullName}::${modelFields[i % modelFields.length]}`,
          mod.path,
          {
            className: modelName,
            type: i === 0 ? 'string' : i === 2 || i === 3 ? 'string' : i === 4 ? 'number' : 'string',
          }
        );
        entities.push(field);
        relationships.push(createRelationship('CONTAINS', model.id, field.id));
      }
      
      fileEntities.push(model);
    });
    
    moduleMap.set(mod.name, fileEntities);
  });

  // 创建模块间导入关系（模拟真实企业应用）
  const moduleOrder = modules.map(m => m.name);
  for (let i = 0; i < moduleOrder.length - 1; i++) {
    const currentModule = moduleMap.get(moduleOrder[i]);
    const nextModule = moduleMap.get(moduleOrder[i + 1]);
    
    if (currentModule && nextModule) {
      // 下一级模块导入上一级
      relationships.push(createRelationship('IMPORTS', nextModule[0].id, currentModule[0].id));
      
      // 组件间引用
      const components = currentModule.filter(e => e.type === 'Component');
      const nextComponents = nextModule.filter(e => e.type === 'Component');
      
      if (components.length > 0 && nextComponents.length > 0) {
        for (let j = 0; j < Math.min(2, nextComponents.length); j++) {
          relationships.push(createRelationship('REFERENCES', nextComponents[j].id, components[Math.floor(Math.random() * components.length)].id));
        }
      }
      
      // 服务间依赖
      const services = currentModule.filter(e => e.type === 'Class');
      const nextServices = nextModule.filter(e => e.type === 'Class');
      
      if (services.length > 0 && nextServices.length > 0) {
        for (let j = 0; j < Math.min(2, nextServices.length); j++) {
          relationships.push(createRelationship('DEPENDS_ON', nextServices[j].id, services[Math.floor(Math.random() * services.length)].id));
        }
      }
    }
  }

  // 为实体分配位置
  assignPositions(entities);
  
  const duration = Date.now() - startTime;
  logger.warn(`🎯 Realistic ArkTS data generated: ${entities.length} entities, ${relationships.length} relationships in ${duration}ms`);
  
  return { entities, relationships };
}

// 💥 终极混乱场景 - 包含所有可能的极端情况（最强大的防御测试）
export function generateUltimateChaosData(): GraphData {
  const startTime = Date.now();
  logger.error('💥💥💥 GENERATING ULTIMATE CHAOS DATA - EXPECTING EVERYTHING TO GO WRONG 💥💥💥');
  
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  const validEntityMap = new Map<string, Entity>();
  
  // 1. 正常的基础数据
  logger.debug('🔹 Generating normal base data');
  for (let i = 0; i < 10; i++) {
    const file = createEntity('File', `NormalFile${i}.ets`, `app/src/normal/NormalFile${i}.ets`, `app/src/normal/NormalFile${i}.ets`);
    entities.push(file);
    validEntityMap.set(file.id, file);
    
    const component = createEntity('Component', `NormalComp${i}`, `${file.fullName}::NormalComp${i}`, file.filePath);
    entities.push(component);
    validEntityMap.set(component.id, component);
    
    relationships.push(createRelationship('CONTAINS', file.id, component.id));
  }
  
  logger.debug('🔹 Base data generated', { entityCount: entities.length, relCount: relationships.length });
  
  // 2. 极端情况1: 超长名称
  logger.debug('🔸 Adding extremely long names');
  const reallyLongName = 'LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloremagnaaliquaUtenimadminimveniamquisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequatDuisauteiruredolorinreprehenderitinvoluptatevelitessecillumdoloreeufugiatnullapariaturExcepteursintoccaecatcupidatatnonproidentsuntinculpaquiofficia deseruntmollitanimidestlaborum';
  const longEntity = createEntity('Class', reallyLongName, `Chaos::${reallyLongName}::Deep::Nested::Structure`);
  entities.push(longEntity);
  validEntityMap.set(longEntity.id, longEntity);
  logger.debug('🔸 Long name entity created', { nameLength: reallyLongName.length });
  
  // 3. 极端情况2: 空/undefined/null值
  logger.debug('🔸 Adding empty/null/undefined values');
  const invalidEntity1 = {
    id: 'invalid-id-1',
    type: 'File',
    name: '',
    fullName: '',
    filePath: null,
    properties: { empty: '', nullVal: null, undefVal: undefined },
    position: { x: Infinity, y: -Infinity, z: NaN }
  };
  entities.push(invalidEntity1 as any);
  
  const invalidEntity2 = {
    id: 'invalid-id-2',
    type: 'Component',
    name: null,
    fullName: null,
    properties: { test: 123 }
  };
  entities.push(invalidEntity2 as any);
  
  // 4. 极端情况3: 循环引用关系网络
  logger.debug('🔸 Creating circular reference network');
  const validList = Array.from(validEntityMap.values());
  for (let i = 0; i < validList.length; i++) {
    for (let j = 0; j < validList.length; j++) {
      if (i !== j && Math.random() > 0.7) {
        relationships.push(createRelationship(
          ['CALLS', 'IMPORTS', 'DEPENDS_ON', 'USES', 'REFERENCES'][Math.floor(Math.random() * 5)],
          validList[i].id,
          validList[j].id
        ));
      }
    }
  }
  
  // 5. 极端情况4: 指向不存在实体的关系
  logger.debug('🔸 Adding relationships to non-existent entities');
  for (let i = 0; i < 20; i++) {
    if (validList.length > 0) {
      try {
        relationships.push(createRelationship(
          'BROKEN_REL',
          validList[0].id,
          `non-existent-target-${Date.now()}-${i}`
        ));
      } catch (e) {
        logger.warn('Expected invalid relationship creation failed (this is good!)', e);
      }
    }
  }
  
  // 6. 极端情况5: 大量重复实体
  logger.debug('🔸 Creating duplicate entities');
  const duplicatesToCreate = 20;
  for (let i = 0; i < duplicatesToCreate; i++) {
    const dup = createEntity('Component', 'DuplicateEntity', 'Chaos::DuplicateEntity');
    entities.push(dup);
    validEntityMap.set(dup.id, dup);
  }
  
  // 7. 极端情况6: 没有position的实体
  logger.debug('🔸 Adding entities without positions');
  for (let i = 0; i < 15; i++) {
    const noPosEntity = createEntity('Method', `NoPosMethod${i}`, `Chaos::NoPosMethod${i}`);
    delete (noPosEntity as any).position;
    entities.push(noPosEntity);
    validEntityMap.set(noPosEntity.id, noPosEntity);
  }
  
  // 8. 极端情况7: 特殊字符和奇怪值
  logger.debug('🔸 Adding entities with special characters');
  const specialEntity1 = createEntity(
    'Field',
    '🌌Special!@#$%^&*()_+Field',
    'Chaos::🌌Special!@#$%^&*()_+Field',
    undefined,
    {
      special: '🌌',
      spaces: '   leading and trailing   ',
      mixed: 'Hello 世界 Привет 🌍'
    }
  );
  entities.push(specialEntity1);
  validEntityMap.set(specialEntity1.id, specialEntity1);
  
  // 9. 极端情况8: 类型转换问题
  logger.debug('🔸 Adding type chaos entities');
  const typeChaos = {
    id: 'type-chaos-entity',
    type: 'StateVariable',
    name: 12345,
    fullName: { nested: true },
    properties: { num: 42, str: 'text', bool: true },
    position: { x: 10.5, y: 20.5, z: true }
  };
  entities.push(typeChaos as any);
  
  // 10. 极端情况9: 空关系和大量关系
  logger.debug('🔸 Creating empty and excessive relationships');
  const validEntityArray = Array.from(validEntityMap.values());
  for (let i = 0; i < 80; i++) {
    if (validEntityArray.length > 1) {
      relationships.push(createRelationship(
        'EMPTY_REL',
        validEntityArray[i % validEntityArray.length].id,
        validEntityArray[(i + 1) % validEntityArray.length].id,
        { isEmpty: true }
      ));
    }
  }
  
  // 11. 最后为有效实体分配位置
  logger.debug('🔹 Assigning positions to valid entities');
  assignPositions(Array.from(validEntityMap.values()));
  
  const duration = Date.now() - startTime;
  logger.warn(`💥💥💥 ULTIMATE CHAOS DATA COMPLETE 💥💥💥`, {
    entityCount: entities.length,
    relationshipCount: relationships.length,
    validEntityCount: validEntityMap.size,
    durationMs: duration
  });
  
  return { entities, relationships };
}
