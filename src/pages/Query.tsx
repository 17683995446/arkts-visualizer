import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Search, Play, Clock, Database } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';

const DEFAULT_QUERY = `// Example: Find all components
// MATCH (c:Component) RETURN c

// Example: Find all methods in a component
// MATCH (comp:Component)-[:CONTAINS]->(m:Method) 
// RETURN comp.name, m.name

// Example: Find relationships between entities
// MATCH (a)-[r]->(b) RETURN a, r, b

// Try a simple query to see results:
MATCH (e) RETURN e LIMIT 10`;

const Query: React.FC = () => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const { graphData } = useGraphStore();

  const runQuery = () => {
    setIsRunning(true);
    
    // Simulate query execution
    setTimeout(() => {
      // Mock query results based on the actual data
      const mockResults = graphData.entities.slice(0, 10).map(entity => ({
        id: entity.id,
        type: entity.type,
        name: entity.name,
        fullName: entity.fullName,
        properties: entity.properties
      }));
      
      setResults(mockResults);
      
      if (!history.includes(query)) {
        setHistory([query, ...history].slice(0, 10));
      }
      
      setIsRunning(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      runQuery();
    }
  };

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-orbitron text-3xl font-bold text-white neon-text mb-2">
          Query Editor
        </h1>
        <p className="text-gray-400">
          Execute Cypher-like queries on your knowledge graph
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Query History */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="font-orbitron text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neon-cyan" />
              History
            </h2>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-500 text-sm">No queries yet</p>
              ) : (
                history.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(q)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                  >
                    <p className="text-gray-300 text-sm truncate">{q.split('\n')[0]}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Query Editor and Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-6"
        >
          {/* Editor */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-neon-cyan" />
                <span className="text-white font-medium">Query</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={runQuery}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isRunning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? 'Running...' : 'Run Query'}
              </motion.button>
            </div>
            <div onKeyDown={handleKeyDown} className="h-80">
              <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={query}
                onChange={(v) => setQuery(v || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true
                }}
              />
            </div>
            <div className="px-4 py-2 border-t border-white/10 text-xs text-gray-500">
              Press <span className="text-neon-cyan">⌘+Enter</span> to run query
            </div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-6"
          >
            <h2 className="font-orbitron text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-neon-purple" />
              Results
              {results.length > 0 && (
                <span className="ml-2 text-sm text-gray-400">
                  ({results.length} items)
                </span>
              )}
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Run a query to see results</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider">Full Name</th>
                      <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider">Properties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, i) => (
                      <motion.tr
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono text-neon-cyan bg-neon-cyan/10">
                            {result.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white font-medium">{result.name}</td>
                        <td className="py-3 px-4 text-gray-300 text-sm font-mono">{result.fullName}</td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-400">
                            {Object.entries(result.properties).map(([key, value]) => (
                              <div key={key} className="truncate">
                                {key}: {String(value)}
                              </div>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Example Queries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-6"
          >
            <h2 className="font-orbitron text-lg font-semibold text-white mb-4">
              Example Queries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: 'Find all files', query: 'MATCH (f:File) RETURN f' },
                { title: 'Find all components', query: 'MATCH (c:Component) RETURN c' },
                { title: 'Get component methods', query: 'MATCH (c)-[:CONTAINS]->(m:Method) RETURN c.name, m.name' },
                { title: 'Find state variables', query: 'MATCH (c)-[:HAS_STATE]->(s) RETURN c.name, s.name' }
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(example.query)}
                  className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/30 transition-all group"
                >
                  <p className="text-white font-medium mb-1 group-hover:text-neon-cyan transition-colors">
                    {example.title}
                  </p>
                  <p className="text-gray-500 text-xs font-mono truncate">
                    {example.query}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Query;
