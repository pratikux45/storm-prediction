import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { Thermometer, Wind } from 'lucide-react';

interface AnimatedTrendChartProps {
  data: any[];
  userSettings: any;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="rounded-xl border border-slate-700/50 bg-slate-900/90 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <p className="mb-2 border-b border-slate-700/50 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Year: {label}
        </p>
        {payload.map((entry: any, index: number) => {
          let unit = "";
          if (entry.dataKey === "avg_temp") unit = "°C";
          else if (entry.dataKey === "avg_humidity") unit = "%";
          else if (entry.dataKey === "max_wind_speed") unit = " mph";
          else if (entry.dataKey === "total_precipitation") unit = " mm";
          else if (entry.dataKey === "storm_events") unit = " events";

          return (
            <div key={index} className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: entry.color, color: entry.color }}
                />
                <span className="text-sm text-slate-300">{entry.name}</span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {entry.value}{unit}
              </span>
            </div>
          );
        })}
      </motion.div>
    );
  }
  return null;
};

export function AnimatedTrendChart({ data, userSettings }: AnimatedTrendChartProps) {
  const [metricGroup, setMetricGroup] = useState<'temp_hum' | 'wind_precip'>('temp_hum');
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const colors = {
    temp: userSettings.colorblindMode ? "#648fff" : "#22d3ee",
    humidity: userSettings.colorblindMode ? "#ffb000" : "#a855f7",
    wind: userSettings.colorblindMode ? "#009e73" : "#f43f5e",
    precip: userSettings.colorblindMode ? "#56b4e9" : "#10b981",
    grid: userSettings.highContrast ? "#ffffff" : "#1e293b",
    text: userSettings.highContrast ? "#ffffff" : "#94a3b8"
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Interactive Tabs Header */}
      <div className="flex justify-end mb-3 z-20 relative">
        <div className="flex bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/80 text-[11px] gap-1 shadow-inner">
          <button
            onClick={() => setMetricGroup('temp_hum')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-all duration-200 ${
              metricGroup === 'temp_hum'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Temp & Humidity
          </button>
          <button
            onClick={() => setMetricGroup('wind_precip')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-semibold transition-all duration-200 ${
              metricGroup === 'wind_precip'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            Wind & Rain
          </button>
        </div>
      </div>

      <div className="relative flex-1 h-[200px] w-full">
        {/* Background ambient glow */}
        <div className={`absolute inset-0 z-0 blur-3xl pointer-events-none transition-all duration-500 ${
          metricGroup === 'temp_hum' ? 'bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5' : 'bg-gradient-to-tr from-rose-500/5 via-transparent to-emerald-500/5'
        }`} />
        
        <ResponsiveContainer width="100%" height="100%" className="relative z-10">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            onMouseLeave={() => setHoveredSeries(null)}
          >
            <defs>
              {/* Temperature gradients */}
              <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.temp} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.temp} stopOpacity={0} />
              </linearGradient>
              {/* Humidity gradients */}
              <linearGradient id="gradHum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.humidity} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.humidity} stopOpacity={0} />
              </linearGradient>
              {/* Precipitation gradients */}
              <linearGradient id="gradPrecip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.precip} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.precip} stopOpacity={0.2} />
              </linearGradient>
              
              <filter id="glowFilter">
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
              dataKey="year" 
              stroke={colors.text} 
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'Inter, sans-serif' }} 
              axisLine={false} 
              tickLine={false} 
              dy={8}
            />
            
            {/* Left YAxis - Temperature / Wind Speed */}
            <YAxis 
              yAxisId="left" 
              stroke={colors.text} 
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'Inter, sans-serif' }} 
              axisLine={false} 
              tickLine={false} 
              label={{ 
                value: metricGroup === 'temp_hum' ? 'Temp (°C)' : 'Wind (mph)', 
                angle: -90, 
                position: 'insideLeft', 
                offset: 10,
                fill: colors.text,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}
            />
            
            {/* Right YAxis - Humidity / Precipitation */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke={colors.text} 
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'Inter, sans-serif' }} 
              axisLine={false} 
              tickLine={false} 
              label={{ 
                value: metricGroup === 'temp_hum' ? 'Humidity (%)' : 'Rain (mm)', 
                angle: 90, 
                position: 'insideRight', 
                offset: 10,
                fill: colors.text,
                fontSize: 10,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif'
              }}
            />
            
            <Tooltip 
              content={<CustomTooltip metricGroup={metricGroup} />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1.5 }}
            />

            {metricGroup === 'temp_hum' ? (
              // View 1: Temperature & Humidity
              [
                <Area
                  key="hum_area"
                  yAxisId="right"
                  type="monotone"
                  dataKey="avg_humidity"
                  name="Humidity"
                  fill="url(#gradHum)"
                  stroke={colors.humidity}
                  strokeWidth={2}
                  opacity={hoveredSeries && hoveredSeries !== 'humidity' ? 0.2 : 0.85}
                  onMouseEnter={() => setHoveredSeries('humidity')}
                  onMouseLeave={() => setHoveredSeries(null)}
                />,
                <Area
                  key="temp_area"
                  yAxisId="left"
                  type="monotone"
                  dataKey="avg_temp"
                  fill="url(#gradTemp)"
                  stroke="none"
                />,
                <Line 
                  key="temp_line"
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avg_temp" 
                  name="Avg Temp" 
                  stroke={colors.temp} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0f172a', stroke: colors.temp, strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: colors.temp, stroke: '#fff', strokeWidth: 2 }}
                  filter="url(#glowFilter)"
                  opacity={hoveredSeries && hoveredSeries !== 'temp' ? 0.2 : 1}
                  onMouseEnter={() => setHoveredSeries('temp')}
                  onMouseLeave={() => setHoveredSeries(null)}
                />
              ]
            ) : (
              // View 2: Wind Speed & Precipitation
              [
                <Bar 
                  key="precip_bar"
                  yAxisId="right" 
                  dataKey="total_precipitation" 
                  name="Precipitation" 
                  fill="url(#gradPrecip)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                  opacity={hoveredSeries && hoveredSeries !== 'precip' ? 0.2 : 1}
                  onMouseEnter={() => setHoveredSeries('precip')}
                  onMouseLeave={() => setHoveredSeries(null)}
                />,
                <Line 
                  key="wind_line"
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="max_wind_speed" 
                  name="Wind Speed" 
                  stroke={colors.wind} 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0f172a', stroke: colors.wind, strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: colors.wind, stroke: '#fff', strokeWidth: 2 }}
                  filter="url(#glowFilter)"
                  opacity={hoveredSeries && hoveredSeries !== 'wind' ? 0.2 : 1}
                  onMouseEnter={() => setHoveredSeries('wind')}
                  onMouseLeave={() => setHoveredSeries(null)}
                />
              ]
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
