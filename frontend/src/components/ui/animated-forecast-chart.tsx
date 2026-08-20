import { motion } from 'framer-motion';
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AnimatedForecastChartProps {
  data: any[];
  userSettings: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const riskLevel = entry.payload.risk_level || "Unknown";
    
    // Get colors matching risk levels
    let riskColorClass = "text-emerald-400";
    if (riskLevel.includes("High")) riskColorClass = "text-red-400";
    else if (riskLevel.includes("Moderate")) riskColorClass = "text-yellow-400";

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="rounded-xl border border-slate-700/50 bg-slate-900/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <p className="mb-2 border-b border-slate-700/50 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Date: {label}
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: entry.color, color: entry.color }}
              />
              <span className="text-sm text-slate-300">Storm Probability</span>
            </div>
            <span className="font-mono text-sm font-bold text-white">
              {entry.value}%
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-6">
            <span className="text-xs text-slate-400">Risk Assessment</span>
            <span className={`text-xs font-bold ${riskColorClass}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function AnimatedForecastChart({ data, userSettings }: AnimatedForecastChartProps) {


  const colors = {
    prob: userSettings.colorblindMode ? "#ffb000" : "#06b6d4", // Cyan theme-color for storm probabilities
    probLight: userSettings.colorblindMode ? "rgba(255, 176, 0, 0.15)" : "rgba(6, 182, 212, 0.15)",
    grid: userSettings.highContrast ? "#ffffff" : "#1e293b",
    text: userSettings.highContrast ? "#ffffff" : "#94a3b8"
  };

  return (
    <div className="relative h-full w-full flex flex-col justify-end">
      {/* Background ambient glow */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 blur-3xl pointer-events-none" />
      
      <div className="relative z-10 flex-1 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 15, right: 10, left: -25, bottom: 0 }}

          >
            <defs>
              <linearGradient id="colorForecastProb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.prob} stopOpacity={0.35} />
                <stop offset="95%" stopColor={colors.prob} stopOpacity={0.02} />
              </linearGradient>
              <filter id="glowForecastFilter">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke={colors.grid} 
              vertical={false} 
            />
            
            <XAxis 
              dataKey="date" 
              stroke={colors.text} 
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'Inter, sans-serif' }} 
              axisLine={false} 
              tickLine={false} 
              dy={8}
            />
            
            <YAxis 
              domain={[0, 100]}
              stroke={colors.text} 
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'Inter, sans-serif' }} 
              axisLine={false} 
              tickLine={false} 
              label={{ 
                value: 'Storm Probability (%)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: 10,
                fill: colors.text,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1.5 }}
            />

            <Area
              type="monotone"
              dataKey="storm_probability"
              name="Storm Probability"
              stroke={colors.prob}
              strokeWidth={3}
              fill="url(#colorForecastProb)"
              dot={{ r: 4, fill: '#0f172a', stroke: colors.prob, strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: colors.prob, stroke: '#fff', strokeWidth: 2 }}
              filter="url(#glowForecastFilter)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
