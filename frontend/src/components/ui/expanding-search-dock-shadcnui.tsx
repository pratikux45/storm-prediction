import { AnimatePresence, motion } from "framer-motion";
import { Search, X, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { INDIAN_CITIES, type CityData } from "../../data/indian_cities";

type ExpandingSearchDockProps = {
  onSearch?: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
};

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export function ExpandingSearchDock({
  onSearch,
  placeholder = "Search city...",
  initialValue = "",
}: ExpandingSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState(initialValue);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim() === "") {
      setFilteredCities([]);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = INDIAN_CITIES.filter(c => 
        c.city.toLowerCase().includes(lowerQuery) || c.state.toLowerCase().includes(lowerQuery)
      ).slice(0, 8); // Limit to 8 items to prevent animation lag
      setFilteredCities(filtered);
    }
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query) {
      const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
      onSearch(formattedQuery);
      setIsExpanded(false);
    }
  };

  const handleCitySelect = (city: string) => {
    setQuery(city);
    setIsExpanded(false);
    if (onSearch) {
      onSearch(city);
    }
  };

  const getRiskDotColor = (level: string) => {
    if (level.includes('High')) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse';
    if (level.includes('Moderate')) return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]';
    if (level.includes('Low')) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
    return 'bg-blue-500';
  };

  return (
    <div className="relative flex justify-center w-full z-50" ref={containerRef}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleExpand}
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-cyan-500/30 bg-slate-800/80 backdrop-blur-md text-cyan-400 transition-all hover:bg-slate-700 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:scale-105 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)]"
          >
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.button>
        ) : (
          <motion.div
            key="input-container"
            initial={{ width: 48, opacity: 0 }}
            animate={{ width: "100%", maxWidth: 380, opacity: 1 }}
            exit={{ width: 48, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="relative w-full"
          >
            <form onSubmit={handleSubmit} className="relative z-20">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-cyan-500/50 bg-slate-800/90 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <div className="ml-4">
                  <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  autoFocus
                  className="h-12 sm:h-14 flex-1 bg-transparent pr-4 text-base sm:text-lg text-white outline-none placeholder:text-slate-400 font-medium tracking-wide"
                />
                <motion.button
                  type="button"
                  onClick={handleCollapse}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="mr-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </form>

            {/* Dropdown List */}
            <AnimatePresence>
              {isExpanded && filteredCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar z-10"
                >
                  <motion.ul
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="p-2 flex flex-col gap-1"
                  >
                    {filteredCities.map((cityObj) => (
                      <motion.li
                        key={cityObj.city}
                        variants={itemVariants}
                      >
                        <button
                          type="button"
                          onClick={() => handleCitySelect(cityObj.city)}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <div>
                              <span className="text-white font-medium block">{cityObj.city}</span>
                              <span className="text-xs text-slate-400">{cityObj.state}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">{cityObj.riskLevel}</span>
                            <span className={`w-3 h-3 rounded-full ${getRiskDotColor(cityObj.riskLevel)}`}></span>
                          </div>
                        </button>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
