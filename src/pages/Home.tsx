import React from 'react';
import { motion } from 'framer-motion';
import { Database, Link2, FileCode, Box, Play, Zap, ToggleLeft, ToggleRight, Skull, Building, Bomb } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import StatCard from '@/components/StatCard';
import { ENTITY_TYPE_COLORS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { statistics, toggleDatasetSize, useLargeDataset, useHugeDataset, useExtremeDataset, useChaosDataset, useRealisticDataset, useUltimateChaosDataset, loadHugeMockData, loadMockData, loadLargeMockData, loadExtremeMockData, loadChaosTestData, loadRealisticArkTSData, loadUltimateChaosData } = useGraphStore();
  const navigate = useNavigate();

  const entityTypes = Object.entries(statistics.entityTypeCounts).filter(
    ([_, count]) => (count as number) > 0
  );

  const relationshipTypes = Object.entries(statistics.relationshipTypeCounts);

  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-orbitron text-4xl font-bold text-white neon-text mb-2">
              Knowledge Graph
            </h1>
            <p className="text-gray-400 text-lg">
              Explore your ArkTS codebase in a whole new dimension
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 glass-panel border border-white/20 rounded-xl overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMockData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${!useLargeDataset && !useHugeDataset && !useExtremeDataset ? 'bg-neon-cyan/30 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ToggleLeft className="w-4 h-4" />
                <span className="font-medium text-sm">Small</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadLargeMockData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useLargeDataset ? 'bg-neon-green/30 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <span className="font-medium text-sm">Large</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadHugeMockData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useHugeDataset ? 'bg-neon-purple/30 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <ToggleRight className="w-4 h-4" />
                <span className="font-medium text-sm">Huge</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadExtremeMockData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useExtremeDataset ? 'bg-red-500/30 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Zap className="w-4 h-4" />
                <span className="font-medium text-sm">Extreme</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadChaosTestData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useChaosDataset ? 'bg-orange-600/30 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}
              >
                <Skull className="w-4 h-4" />
                <span className="font-medium text-sm">Chaos</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadRealisticArkTSData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useRealisticDataset ? 'bg-blue-600/30 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}
              >
                <Building className="w-4 h-4" />
                <span className="font-medium text-sm">Enterprise</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.85 }}
                onClick={loadUltimateChaosData}
                className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${useUltimateChaosDataset ? 'bg-red-600/50 text-white animate-bounce shadow-lg shadow-red-500/30 border border-red-500/50' : 'text-red-400 hover:text-red-200 hover:bg-red-900/30'}`}
              >
                <Bomb className="w-4 h-4" />
                <span className="font-medium text-sm">💥 Ultimate Chaos</span>
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/graph')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-neon-cyan/25 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              Start Exploring
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Total Entities"
          value={statistics.totalEntities}
          icon={Database}
          color="#00E5FF"
          delay={0.1}
        />
        <StatCard
          title="Relationships"
          value={statistics.totalRelationships}
          icon={Link2}
          color="#9D4EDD"
          delay={0.2}
        />
        <StatCard
          title="Entity Types"
          value={entityTypes.length}
          icon={Box}
          color="#39FF14"
          delay={0.3}
        />
        <StatCard
          title="Files"
          value={statistics.entityTypeCounts.File}
          icon={FileCode}
          color="#FF006E"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Types */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" />
            Entity Distribution
          </h2>
          <div className="space-y-4">
            {entityTypes.map(([type, count], index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 font-medium">{type}</span>
                  <span 
                    className="font-orbitron font-bold"
                    style={{ color: ENTITY_TYPE_COLORS[type as keyof typeof ENTITY_TYPE_COLORS] }}
                  >
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((count as number) / statistics.totalEntities) * 100}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: ENTITY_TYPE_COLORS[type as keyof typeof ENTITY_TYPE_COLORS],
                      boxShadow: `0 0 10px ${ENTITY_TYPE_COLORS[type as keyof typeof ENTITY_TYPE_COLORS]}50`
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Relationship Types */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="font-orbitron text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-neon-purple" />
            Relationships
          </h2>
          <div className="space-y-4">
            {relationshipTypes.map(([type, count], index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-gray-300 font-mono">{type}</span>
                <span className="font-orbitron font-bold text-neon-purple">{count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 glass-panel rounded-2xl p-6"
      >
        <h2 className="font-orbitron text-xl font-semibold text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            title="View Graph"
            description="Explore the 3D knowledge graph"
            icon={Database}
            color="#00E5FF"
            onClick={() => navigate('/graph')}
          />
          <QuickAction
            title="Analyze Code"
            description="Browse files and entities"
            icon={FileCode}
            color="#9D4EDD"
            onClick={() => navigate('/analysis')}
          />
          <QuickAction
            title="Run Queries"
            description="Execute Cypher queries"
            icon={Zap}
            color="#39FF14"
            onClick={() => navigate('/query')}
          />
        </div>
      </motion.div>
    </div>
  );
};

const QuickAction: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}> = ({ title, description, icon: Icon, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="text-left p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}20` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{description}</p>
  </motion.button>
);

export default Home;
