# 🚀 ArkTS Knowledge Graph Visualizer

> 赛博朋克霓虹风格的3D知识图谱可视化系统

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production_ready-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)

## 🎯 项目简介

这是一个高性能的 **ArkTS 代码知识图谱 3D 可视化系统**，采用赛博朋克霓虹风格设计，支持大规模复杂场景的实时可视化。

### ✨ 核心特性

- 🎨 **赛博朋克霓虹风格** - 精美的暗色系UI设计
- 🌐 **3D 可视化** - 使用 React Three Fiber 构建
- ⚡ **高性能** - 支持 10000+ 实体实时渲染
- 🔒 **健壮性** - 完善的防御性编程和错误处理
- ⌨️ **键盘快捷键** - 高效的操作体验
- 📊 **实时监控** - FPS 和内存占用监控

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 6.x | 构建工具 |
| Three.js | ^0.160 | 3D 渲染 |
| React Three Fiber | ^8.x | React 3D |
| Zustand | ^4.x | 状态管理 |
| Tailwind CSS | ^3.x | 样式框架 |
| Framer Motion | ^11.x | 动画效果 |

## 🚀 快速开始

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:5173/

### 构建

```bash
npm run build
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `1` | 导航到首页 |
| `2` | 导航到图谱页 |
| `3` | 导航到分析页 |
| `4` | 导航到查询页 |
| `ESC` | 取消选择实体 |
| `Ctrl+P` | 切换性能监控 |

## 📊 测试数据集

| 数据集 | 实体数量 | 用途 |
|--------|---------|------|
| Small | ~20 | 基础测试 |
| Large | 200-500 | 中等规模 |
| Huge | 1000-2000 | 大规模 |
| Extreme | 10000+ | 极限测试 |
| Chaos | 混乱 | 边界测试 |
| Realistic | 企业级 | 真实场景 |
| Ultimate Chaos | 极限混乱 | 综合测试 |

## 🎯 测试覆盖

### 11 种极端场景测试

1. ✅ 极端名称长度 (500+ 字符)
2. ✅ 特殊 Unicode 字符 (emoji/中文)
3. ✅ 深层嵌套结构
4. ✅ 超大属性对象
5. ✅ 循环引用
6. ✅ 孤立实体
7. ✅ 自引用关系
8. ✅ 超大关系网络
9. ✅ 极端坐标值
10. ✅ 超多样本量 (10000+)
11. ✅ 混合异常类型

### 验收标准

- ✅ 代码所有逻辑分支 100% 可执行
- ✅ 运行行为与代码定义完全一致
- ✅ 数据流转无误，无逻辑冲突
- ✅ 异常场景可平稳兜底

## 📁 项目结构

```
visualizer/
├── src/
│   ├── components/     # React 组件
│   │   ├── Graph3D.tsx              # 基础图谱
│   │   ├── OptimizedGraph3D.tsx    # 优化图谱
│   │   ├── ExtremeOptimizedGraph3D.tsx # 极限优化
│   │   ├── PerformanceMonitor.tsx  # 性能监控
│   │   └── ErrorBoundary.tsx       # 错误边界
│   ├── pages/          # 页面组件
│   ├── store/          # Zustand 状态管理
│   ├── lib/            # 工具函数和数据生成
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   └── tests/          # 测试报告
└── public/             # 静态资源
```

## 🔒 质量保证

### 代码质量

- ✅ TypeScript 严格模式
- ✅ ESLint 代码规范
- ✅ 完善的类型定义
- ✅ 防御性编程

### 测试覆盖

- ✅ 单元测试计划
- ✅ 集成测试
- ✅ 极端场景测试
- ✅ 性能基准测试

### 错误处理

- ✅ 统一日志系统
- ✅ 完善的 ErrorBoundary
- ✅ 异常捕获机制
- ✅ 降级策略

## 📈 性能指标

| 指标 | 基准值 |
|------|--------|
| Small 数据 FPS | > 55 |
| Large 数据 FPS | > 45 |
| Huge 数据 FPS | > 30 |
| Extreme 数据 FPS | > 20 |
| 构建时间 | < 10s |
| 包大小 | < 1.4MB |

## 🎨 UI 设计

### 颜色方案

- **主色**: `#00E5FF` (Neon Cyan)
- **次色**: `#9D4EDD` (Neon Purple)
- **强调色**: `#FF006E` (Neon Pink)
- **背景**: `#0A0F1C` (Space Dark)

### 组件设计

- 玻璃态效果 (Glassmorphism)
- 霓虹发光效果
- 流畅的动画过渡
- 响应式布局

## 🔮 未来规划

### 阶段五：数据导出功能

- PNG 图片导出
- JSON 数据导出
- SVG 矢量图导出

### 阶段六：主题个性化

- 深色/浅色主题切换
- 自定义配色方案

### 阶段七：高级交互

- 多视角预设
- 节点聚类
- 搜索历史

### 阶段八：Neo4j 集成

- 数据库连接
- 实时查询
- 数据同步

## 📝 开发指南

### 添加新的数据集

```typescript
// src/lib/mockData.ts
export function generateCustomData(): GraphData {
  const entities: Entity[] = [];
  const relationships: Relationship[] = [];
  
  // 生成实体...
  // 生成关系...
  // 分配位置...
  
  return { entities, relationships };
}
```

### 添加新的实体类型

```typescript
// src/types/index.ts
export type EntityType = 
  | 'File' 
  | 'Class' 
  | 'Component' 
  | 'Method' 
  | 'Field' 
  | 'StateVariable'
  | 'YourNewType'; // 添加新类型
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 👨‍💻 作者

**ArkTS Visualizer Team**

## 🙏 致谢

- [React Three Fiber](https://github.com/pmndrs/react-three-fiber) - React 3D 渲染
- [Drei](https://github.com/pmndrs/drei) - React Three Fiber 工具集
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理
- [Framer Motion](https://www.framer.com/motion/) - 动画库

---

<div align="center">

**Made with ❤️ and 🚀**

**Version**: 1.0.0 | **Status**: Production Ready

</div>
