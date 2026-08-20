import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Database, Activity, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MLDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MLDashboardModal({ isOpen, onClose }: MLDashboardModalProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{dataKey: string, index: number} | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);

  const FALLBACK_METRICS = [
    {
      "model_name": "Random Forest",
      "accuracy": 0.943,
      "precision": 0.943704,
      "recall": 0.943,
      "f1_score": 0.943138
    },
    {
      "model_name": "Logistic Regression",
      "accuracy": 0.944,
      "precision": 0.944144,
      "recall": 0.944,
      "f1_score": 0.944019
    },
    {
      "model_name": "Gradient Boosting",
      "accuracy": 0.946,
      "precision": 0.946387,
      "recall": 0.946,
      "f1_score": 0.945955
    },
    {
      "model_name": "Deep Learning",
      "accuracy": 0.985,
      "precision": 0.985043,
      "recall": 0.985,
      "f1_score": 0.984998
    }
  ];

  const renderCustomBar = (dataKey: string, color: string) => (props: any) => {
    const { x, y, width, height, index } = props;
    // Don't render if height is negative or zero to prevent SVG errors
    if (height <= 0) return null;
    
    const isHovered = hoveredBar?.dataKey === dataKey && hoveredBar?.index === index;
    const isOtherHovered = hoveredBar !== null && !isHovered;
    
    return (
      <g style={{
        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        opacity: isOtherHovered ? 0.3 : 1,
        transform: isHovered ? `scale(1.05)` : `scale(1)`,
        transformOrigin: `${x + width/2}px ${y + height}px`,
        filter: isHovered ? `drop-shadow(0 0 12px ${color})` : 'none'
      }}>
        <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />
      </g>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[rgba(10,20,30,0.95)] backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl transition-all duration-200">
          <p className="text-white font-bold mb-2 text-md border-b border-white/10 pb-2">{label}</p>
          <div className="flex flex-col gap-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}` }} />
                <span className="text-slate-300 text-sm font-medium tracking-wide">{entry.name}:</span>
                <span className="text-white text-sm font-bold ml-auto">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsChartReady(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsChartReady(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('http://127.0.0.1:8000/api/model-performance')
        .then(res => {
          if (!res.ok) throw new Error("Failed to load metrics");
          return res.json();
        })
        .then(data => {
          setMetrics(data);
          setLoading(false);
        })
        .catch(err => {
          console.warn("Using local performance metrics fallback:", err);
          setMetrics(FALLBACK_METRICS);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Prepare data for Recharts
  const chartData = Array.isArray(metrics) ? metrics.map((model: any) => {
    return {
      name: model.model_name,
      Accuracy: parseFloat((model.accuracy * 100).toFixed(1)),
      Precision: parseFloat((model.precision * 100).toFixed(1)),
      Recall: parseFloat((model.recall * 100).toFixed(1)),
      F1: parseFloat((model.f1_score * 100).toFixed(1)),
    };
  }) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-7xl max-h-[90vh] bg-[rgba(13,27,42,0.85)] backdrop-blur-md border border-white/5 rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center p-5 px-6 border-b border-white/10 shrink-0 gap-4">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 border border-white/10 rounded-xl shadow-inner">
                  <Database className="w-6 h-6 text-[#00e5ff]" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">Machine Learning Pipeline Analytics</h2>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 px-6 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {chartData.map((model, idx) => (
                      <div key={idx} className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all hover:border-white/20 group">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-white tracking-wide truncate pr-2">{model.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 text-slate-300 rounded-full shrink-0">
                            v2.1
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400 font-medium tracking-wide">Accuracy</span>
                              <span className="text-white font-bold">{model.Accuracy}%</span>
                            </div>
                            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#00e5ff] h-full rounded-full shadow-[0_0_10px_#00e5ff] transition-all duration-1000 ease-out" style={{ width: `${model.Accuracy}%` }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-slate-400 font-medium tracking-wide">F1 Score</span>
                              <span className="text-white font-bold">{model.F1}%</span>
                            </div>
                            <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#6366f1] h-full rounded-full shadow-[0_0_10px_#6366f1] transition-all duration-1000 ease-out" style={{ width: `${model.F1}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Charts Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 bg-white/5 rounded-2xl p-5 border border-white/10 shadow-inner flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 shrink-0">
                        <Activity className="w-5 h-5 text-[#00e5ff]" />
                        Comprehensive Metric Comparison
                      </h3>
                      <div className="flex-1 min-h-[260px] h-[260px]">
                        {isChartReady ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: -15, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif' }} tickMargin={8} />
                              <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter, sans-serif' }} />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontFamily: 'Inter, sans-serif' }} iconType="circle" />
                              <Bar 
                                dataKey="Accuracy" 
                                fill="#00e5ff" 
                                shape={renderCustomBar("Accuracy", "#00e5ff")}
                                onMouseEnter={(_, index) => setHoveredBar({ dataKey: "Accuracy", index })}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                              <Bar 
                                dataKey="F1" 
                                name="F1 Score"
                                fill="#6366f1" 
                                shape={renderCustomBar("F1", "#6366f1")}
                                onMouseEnter={(_, index) => setHoveredBar({ dataKey: "F1", index })}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                              <Bar 
                                dataKey="Precision" 
                                fill="#06b6d4" 
                                shape={renderCustomBar("Precision", "#06b6d4")}
                                onMouseEnter={(_, index) => setHoveredBar({ dataKey: "Precision", index })}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                              <Bar 
                                dataKey="Recall" 
                                fill="#94a3b8" 
                                shape={renderCustomBar("Recall", "#94a3b8")}
                                onMouseEnter={(_, index) => setHoveredBar({ dataKey: "Recall", index })}
                                onMouseLeave={() => setHoveredBar(null)}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-slate-400 text-sm animate-pulse">Loading analytics chart...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-inner flex flex-col">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 shrink-0">
                        <Target className="w-5 h-5 text-[#6366f1]" />
                        Architecture Highlights
                      </h3>
                      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <h4 className="text-[#00e5ff] text-sm font-bold mb-1 tracking-wide">Deep Learning <span className="text-white/50 text-xs ml-1 font-normal">(Recommended)</span></h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">Multi-layered neural networks extract highly complex spatiotemporal patterns. State-of-the-art predictive accuracy.</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <h4 className="text-[#6366f1] text-sm font-bold mb-1 tracking-wide">Gradient Boosting</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">Builds sequential decision trees, minimizing prediction errors iteratively. Effective for tabular meteorological data.</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <h4 className="text-[#06b6d4] text-sm font-bold mb-1 tracking-wide">Random Forest</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">Ensemble of decision trees reduces variance. Highly robust against outlier readings in historical storm records.</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <h4 className="text-[#94a3b8] text-sm font-bold mb-1 tracking-wide">Logistic Regression</h4>
                          <p className="text-[11px] text-slate-300 leading-relaxed">Baseline linear classification. Offers high interpretability for determining direct impact of individual features.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
