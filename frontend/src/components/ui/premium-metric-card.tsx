import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';


interface PremiumMetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  delay?: number;
  className?: string;
  trend?: "up" | "down" | "neutral";
}

export function PremiumMetricCard({
  icon: Icon,
  label,
  value,
  delay = 0,
  className,
  trend,
}: PremiumMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-[1px] transition-all",
        className
      )}
    >
      {/* Animated gradient border */}
      <span className="absolute inset-0 z-0 bg-gradient-to-br from-cyan-400/50 via-blue-500/0 to-purple-500/50 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Static subtle border */}
      <span className="absolute inset-0 z-0 bg-slate-700/50 rounded-2xl" />

      {/* Card Content background */}
      <div className="relative z-10 flex h-full flex-col justify-between rounded-2xl bg-slate-900/40 p-4 backdrop-blur-md shadow-lg shadow-black/20">
        
        {/* Glow behind the icon */}
        <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-cyan-500/20 blur-2xl transition-all duration-500 group-hover:bg-cyan-400/40 group-hover:scale-150" />

        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 border border-slate-600/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-colors group-hover:border-cyan-400/50 group-hover:text-cyan-300">
            <Icon className="h-5 w-5" />
          </div>
          {trend && (
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded-full bg-slate-800/50 border",
              trend === "up" ? "text-emerald-400 border-emerald-400/30" : 
              trend === "down" ? "text-red-400 border-red-400/30" : 
              "text-slate-400 border-slate-600/30"
            )}>
              {trend === "up" ? "↑" : trend === "down" ? "↓" : "−"}
            </span>
          )}
        </div>

        <div className="relative z-10">
          <motion.div 
            className="text-2xl font-light text-white tracking-tight"
            layoutId={`value-${label}`}
          >
            {value}
          </motion.div>
          <div className="mt-1 text-sm font-medium text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-300">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
