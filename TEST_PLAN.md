# ArkTS 知识图谱可视化系统 - 测试计划

## 一、基准定调
基于项目代码和实际运行逻辑，进行系统性测试。

---

## 二、测试前置动作

### 2.1 代码分层结构

```
📦 visualizer/src
 ├── 📁 components/         # UI组件层
 │   ├── ErrorBoundary.tsx         # 错误边界
 │   ├── OptimizedGraph3D.tsx     # 优化3D渲染
 │   ├── SafeGraph3D.tsx          # 安全3D组件
 │   ├── PerformanceMonitor.tsx   # 性能监控
 │   └── StatCard.tsx             # 统计卡片
 ├── 📁 pages/              # 页面层
 │   ├── Home.tsx                 # 首页
 │   ├── Graph.tsx                # 3D图谱
 │   └── Analysis.tsx             # 分析
 ├── 📁 store/              # 状态管理层
 │   └── useGraphStore.ts         # Zustand状态管理
 ├── 📁 lib/               # 工具库层
 │   ├── mockData.ts              # 测试数据生成
 │   └── utils.ts                 # 工具函数
 ├── 📁 types/              # 类型定义
 │   └── index.ts
 └── 📁 utils/              # 工具
     └── debugLogger.ts           # 日志系统
```

---

### 2.2 核心模块依赖关系

```
App.tsx
  ├─ ErrorBoundary (顶层错误处理)
  ├─ Navigation (导航)
  ├─ Home.tsx
  │   ├─ StatCard
  │   └─ useGraphStore
  ├─ Graph.tsx
  │   ├─ SafeGraph3D
  │   │  ├─ OptimizedGraph3D / ExtremeOptimizedGraph3D
  │   │  └─ ErrorBoundary
  │   └─ useGraphStore
  ├─ Analysis.tsx
  └─ PerformanceMonitor
```

---

## 三、测试用例清单

### 3.1 基础数据生成测试 ([mockData.ts])

| 测试点 | 测试场景 | 期望 |
|--------|---------|------|
| generateId | 正常情况 | 生成唯一ID |
| validateEntityName | 空值 | 返回 "UnnamedEntity" |
| validateEntityName | 超长名称 | 截断到100字符 |
| createEntity | 正常情况 | 返回完整实体 |
| createRelationship | 缺少sourceId | 抛出错误 |
| createRelationship | 缺少targetId | 抛出错误 |
| generateMockData | 正常调用 | 返回有内容的图谱 |
| generateLargeMockData | 大数据生成 | 成功执行 |
| generateHugeMockData | 超大数据 | 成功执行 |
| generateExtremeMockData | 极端数据 | 成功执行 |
| generateChaosTestData | 混乱数据 | 成功执行 |
| generateUltimateChaosData | 终极混乱 | 成功执行 |
| generateRealisticArkTSData | 真实企业数据 | 成功执行 |

### 3.2 状态管理测试 ([useGraphStore.ts])

| 测试点 | 测试场景 | 期望 |
|--------|---------|------|
| setGraphData | null输入 | 不崩溃 |
| setGraphData | 空数组 | 正常处理 |
| setGraphData | 有效数据 | 更新成功 |
| selectEntity | 选择实体 | 状态更新 |
| selectEntity | null选择 | 清空选中 |
| loadMockData | 正常调用 | 数据加载成功 |
| loadLargeMockData | 大数据加载 | 无异常 |
| toggleDatasetSize | 切换大小 | 状态正确 |
| calculateStatistics | 空数据 | 不崩溃 |

### 3.3 3D渲染测试 ([OptimizedGraph3D.tsx])

| 测试点 | 测试场景 | 期望 |
|--------|---------|------|
| isSafeCoordinate | NaN值 | 返回 false |
| isSafeCoordinate | Infinity值 | 返回 false |
| hasValidPosition | 缺少x坐标 | 返回 false |
| getSafeColor | 未知类型 | 返回默认颜色 |
| render node | 无位置实体 | 跳过渲染 |
| render line | 无效坐标 | 跳过渲染 |

### 3.4 错误边界测试 ([ErrorBoundary.tsx])

| 测试点 | 测试场景 | 期望 |
|--------|---------|------|
| 正常情况 | 子组件正常渲染 | 不触发错误 |
| 错误抛出 | 子组件报错 | 显示错误界面 |
| 重试按钮 | 点击重试 | 尝试恢复 |
| 多次重试 | 达到最大次数 | 禁用重试 |

### 3.5 页面跳转测试

| 测试点 | 测试场景 | 期望 |
|--------|---------|------|
| 首页导航 | 点击导航菜单 | 正确跳转 |
| 从首页进入Graph | 点击按钮 | 正常跳转 |

---

## 四、边界情况测试清单

### 4.1 数据边界

- [ ] 0个实体
- [ ] 0个关系
- [ ] 10000个实体
- [ ] 20000个关系
- [ ] 重复ID
- [ ] 空属性
- [ ] 超大属性值
- [ ] 特殊字符
- [ ] 循环引用

### 4.2 状态边界

- [ ] searchQuery为空
- [ ] searchQuery超长
- [ ] selectedEntity为空
- [ ] visibleEntityTypes为空
- [ ] isLoading为true
- [ ] 所有类型都隐藏

### 4.3 异常情况

- [ ] entity为null
- [ ] entity.position为null
- [ ] entity.properties包含循环引用
- [ ] 抛出异常的子组件
- [ ] 网络错误
- [ ] 内存不足

---

## 五、验收标准

1. **代码所有逻辑分支100%可执行**
2. **运行行为与代码定义完全一致**
3. **数据流转无误，无逻辑冲突与隐性缺陷**
4. **异常场景可平稳兜底，无崩溃报错**
5. **性能稳定，无明显卡顿**
