import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Monitor, Eye, Palette } from "lucide-react";
import { useEffect, useState } from "react";

interface UserSettings {
  reduceMotion: boolean;
  highContrast: boolean;
  colorblindMode: boolean;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  savedCities?: string[];
  onCitySelect?: (city: string) => void;
  userSettings?: UserSettings;
  onUpdateSetting?: (key: string, value: boolean) => void;
}

export function SideMenu({ 
  isOpen, 
  onClose, 
  onNavigate, 
  savedCities = [], 
  onCitySelect,
  userSettings = { reduceMotion: false, highContrast: false, colorblindMode: false },
  onUpdateSetting
}: SideMenuProps) {
  const [isSavedExpanded, setIsSavedExpanded] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

  // Prevent scrolling on the body when the menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setIsSavedExpanded(false); // Reset accordion on close
      setIsSettingsExpanded(false);
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const menuItems = [
    { 
      id: "radar-map", 
      label: "Live Radar Map", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
          <path pathLength="1" d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path pathLength="1" d="M15 5.764v15"/><path pathLength="1" d="M9 3.236v15"/>
        </svg>
      ) 
    },
    { 
      id: "ml-dashboard", 
      label: "ML Performance", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
          <ellipse pathLength="1" cx="12" cy="5" rx="9" ry="3"/><path pathLength="1" d="M3 5V19A9 3 0 0 0 21 19V5"/><path pathLength="1" d="M3 12A9 3 0 0 0 21 12"/>
        </svg>
      ) 
    },
    { 
      id: "saved-locations", 
      label: "Saved Locations", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
          <path pathLength="1" d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle pathLength="1" cx="12" cy="10" r="3"/>
        </svg>
      ) 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon">
          <path pathLength="1" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle pathLength="1" cx="12" cy="12" r="3"/>
        </svg>
      ) 
    },
  ];

  const handleItemClick = (id: string) => {
    if (id === "saved-locations") {
      setIsSavedExpanded(!isSavedExpanded);
    } else if (id === "settings") {
      setIsSettingsExpanded(!isSettingsExpanded);
    } else {
      onNavigate(id);
      onClose();
    }
  };

  const handleCityClick = (city: string) => {
    if (onCitySelect) {
      onCitySelect(city);
    }
  };

  const ToggleSwitch = ({ label, icon, value, onChange }: { label: string, icon: React.ReactNode, value: boolean, onChange: () => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-800/50 last:border-0 group cursor-pointer" onClick={onChange}>
      <div className="flex items-center gap-3">
        <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <button 
        type="button" 
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${value ? 'bg-cyan-500' : 'bg-slate-700'}`}
        role="switch"
        aria-checked={value}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .menu-icon path, .menu-icon circle, .menu-icon ellipse {
          stroke-dasharray: 1;
          stroke-dashoffset: 0;
        }
        .menu-item:hover .menu-icon path,
        .menu-item:hover .menu-icon circle,
        .menu-item:hover .menu-icon ellipse {
          stroke-dashoffset: 1;
          animation: drawIcon 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes drawIcon {
          0% { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        .menu-item-text {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .menu-item:hover .menu-item-text {
          transform: translateX(4px);
        }
      `}</style>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Full-screen Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={onClose}
            />

            {/* Slide-out Floating Panel Drawer */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-4 bottom-4 right-4 w-80 max-w-[calc(100vw-32px)] bg-[rgba(10,25,41,0.7)] backdrop-blur-md border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-[9999] flex flex-col rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide">
                  Menu
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, index) => (
                  <div key={item.id} className="flex flex-col">
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      onClick={() => handleItemClick(item.id)}
                      className={`menu-item w-full flex items-center justify-between px-4 py-4 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/5 transition-all group relative overflow-hidden ${(item.id === 'saved-locations' && isSavedExpanded) || (item.id === 'settings' && isSettingsExpanded) ? 'bg-white/5 text-cyan-300' : ''}`}
                    >
                      <div className="absolute left-0 top-0 h-full w-1 bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full" />
                      <div className="flex items-center gap-4">
                        <div className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                          {item.icon}
                        </div>
                        <span className="menu-item-text font-medium tracking-wide text-lg">{item.label}</span>
                      </div>
                    {item.id === "saved-locations" && (
                       <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isSavedExpanded ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                    )}
                    {item.id === "settings" && (
                       <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isSettingsExpanded ? 'rotate-180 text-cyan-400' : 'text-slate-500'}`} />
                    )}
                  </motion.button>

                  {/* Expandable Saved Locations Section */}
                  {item.id === "saved-locations" && (
                    <AnimatePresence>
                      {isSavedExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden px-4"
                        >
                          <div className="py-4 flex flex-wrap gap-2 border-l-2 border-slate-800 ml-4 pl-4">
                            {savedCities.length > 0 ? (
                              savedCities.map(city => (
                                <button
                                  key={city}
                                  onClick={() => handleCityClick(city)}
                                  className="px-3 py-1.5 text-sm font-medium text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 rounded-full transition-all"
                                >
                                  {city}
                                </button>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 italic py-2">No saved locations yet. Click the star icon to save a city!</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Expandable Settings Section */}
                  {item.id === "settings" && (
                    <AnimatePresence>
                      {isSettingsExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden px-4"
                        >
                          <div className="py-4 flex flex-col border-l-2 border-slate-800 ml-4 pl-4 gap-1">
                            <ToggleSwitch 
                              label="Reduce Motion" 
                              icon={<Monitor className="w-4 h-4" />}
                              value={userSettings.reduceMotion}
                              onChange={() => onUpdateSetting && onUpdateSetting('reduceMotion', !userSettings.reduceMotion)}
                            />
                            <ToggleSwitch 
                              label="High Contrast Mode" 
                              icon={<Eye className="w-4 h-4" />}
                              value={userSettings.highContrast}
                              onChange={() => onUpdateSetting && onUpdateSetting('highContrast', !userSettings.highContrast)}
                            />
                            <ToggleSwitch 
                              label="Colorblind Charts" 
                              icon={<Palette className="w-4 h-4" />}
                              value={userSettings.colorblindMode}
                              onChange={() => onUpdateSetting && onUpdateSetting('colorblindMode', !userSettings.colorblindMode)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
            
            {/* Footer Area */}
            <div className="p-6 border-t border-white/5">
              <div className="text-xs text-slate-500 flex flex-col gap-1">
                <span>StormTracker Pro Max UI</span>
                <span>Version 2.5.0</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
