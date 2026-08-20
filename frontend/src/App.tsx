"use client";

import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudRain, Wind, Zap, Menu, Star, MapPin, Download } from "lucide-react";
import { cn } from "./lib/utils";
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { ExpandingSearchDock } from './components/ui/expanding-search-dock-shadcnui';
import WeatherMap from './components/WeatherMap';
import { SideMenu } from './components/ui/side-menu';
import { INDIAN_CITIES } from './data/indian_cities';
import { PremiumMetricCard } from './components/ui/premium-metric-card';
import { AnimatedTrendChart } from './components/ui/animated-trend-chart';
import { AnimatedForecastChart } from './components/ui/animated-forecast-chart';
import { MLDashboardModal } from './components/ui/MLDashboardModal';
import { jsPDF } from 'jspdf';
import { toJpeg } from 'html-to-image';

// Interfaces
interface RainDrop {
  id: number;
  left: number;
  animationDuration: number;
  opacity: number;
  size: number;
  delay: number;
}

interface LightningBolt {
  id: number;
  type: "flash" | "bolt";
  intensity: number;
  duration: number;
}

interface WeatherEffectProps {
  rainIntensity?: number;
  rainSpeed?: number;
  rainColor?: string;
  rainAngle?: number;
  rainDropSize?: { min: number; max: number };
  lightningEnabled?: boolean;
  lightningFrequency?: number;
  lightningHue?: number;
  lightningXOffset?: number;
  lightningSpeed?: number;
  lightningIntensity?: number;
  lightningSize?: number;
  thunderEnabled?: boolean;
  thunderVolume?: number;
  thunderDelay?: number;
  className?: string;
  children?: React.ReactNode;
}

// WebGL Lightning Component
const Lightning: React.FC<
  Pick<
    WeatherEffectProps,
    | "lightningHue"
    | "lightningXOffset"
    | "lightningSpeed"
    | "lightningIntensity"
    | "lightningSize"
  >
> = memo(
  ({
    lightningHue = 230,
    lightningXOffset = 0,
    lightningSpeed = 1,
    lightningIntensity = 1,
    lightningSize = 1,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const gl = canvas.getContext("webgl");
      if (!gl) {
        console.error("WebGL is not supported in this browser.");
        return;
      }

      let animationFrameId: number;

      const resizeCanvas = () => {
        if (
          canvas.parentElement &&
          canvas.parentElement.clientWidth > 0 &&
          canvas.parentElement.clientHeight > 0
        ) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
        } else {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();

      const vertexShaderSource = `
        attribute vec2 aPosition;
        void main() {
          gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `;
      const fragmentShaderSource = `
        precision mediump float;
        uniform vec2 iResolution;
        uniform float iTime;
        uniform float uHue;
        uniform float uXOffset;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform float uSize;
        
        #define OCTAVE_COUNT 10

        vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
        }

        float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
        }

        float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }

        mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
        }

        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
            value += amplitude * noise(p);
            p *= rotate2d(0.45);
            p *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          uv.x += uXOffset;
          
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
          float dist = abs(uv.x);
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          gl_FragColor = vec4(pow(col, vec3(1.0)), 1.0);
        }
      `;

      const compileShader = (source: string, type: number): WebGLShader | null => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error(`Shader compile error:`, gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
      const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking error:", gl.getProgramInfoLog(program));
        return;
      }
      gl.useProgram(program);

      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const aPosition = gl.getAttribLocation(program, "aPosition");
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      const iResolutionLocation = gl.getUniformLocation(program, "iResolution");
      const iTimeLocation = gl.getUniformLocation(program, "iTime");
      const uHueLocation = gl.getUniformLocation(program, "uHue");
      const uXOffsetLocation = gl.getUniformLocation(program, "uXOffset");
      const uSpeedLocation = gl.getUniformLocation(program, "uSpeed");
      const uIntensityLocation = gl.getUniformLocation(program, "uIntensity");
      const uSizeLocation = gl.getUniformLocation(program, "uSize");

      const startTime = performance.now();

      const renderLoop = () => {
        if (!gl.isContextLost()) {
          gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height);
          gl.uniform1f(iTimeLocation, (performance.now() - startTime) / 1000.0);
          gl.uniform1f(uHueLocation, lightningHue);
          gl.uniform1f(uXOffsetLocation, lightningXOffset);
          gl.uniform1f(uSpeedLocation, lightningSpeed);
          gl.uniform1f(uIntensityLocation, lightningIntensity);
          gl.uniform1f(uSizeLocation, lightningSize);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        animationFrameId = requestAnimationFrame(renderLoop);
      };

      renderLoop();

      return () => {
        window.removeEventListener("resize", resizeCanvas);
        cancelAnimationFrame(animationFrameId);
        if (!gl.isContextLost()) {
          gl.deleteProgram(program);
          gl.deleteShader(vertexShader);
          gl.deleteShader(fragmentShader);
          gl.deleteBuffer(vertexBuffer);
        }
      };
    }, [
      lightningHue,
      lightningXOffset,
      lightningSpeed,
      lightningIntensity,
      lightningSize,
    ]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
  }
);

Lightning.displayName = "Lightning";

// Weather Effect Component
const DEFAULT_RAIN_DROP_SIZE = { min: 1, max: 2 };
const WeatherEffect: React.FC<WeatherEffectProps> = ({
  rainIntensity = 150,
  rainSpeed = 0.15,
  rainColor = "rgba(174, 194, 224, 0.6)",
  rainAngle = 10,
  rainDropSize = DEFAULT_RAIN_DROP_SIZE,
  lightningEnabled = true,
  lightningFrequency = 5,
  lightningHue = 200,
  lightningXOffset = 0,
  lightningSpeed = 0.8,
  lightningIntensity = 1.2,
  lightningSize = 1.5,
  thunderEnabled = true,
  thunderVolume = 0.5,
  thunderDelay = 1.5,
  className,
  children,
}) => {
  const [raindrops, setRaindrops] = useState<RainDrop[]>([]);
  const [lightning, setLightning] = useState<LightningBolt | null>(null);
  const thunderAudioRef = useRef<HTMLAudioElement | null>(null);
  const lightningTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (thunderEnabled && typeof window !== "undefined") {
      const audio = new Audio();
      audio.volume = thunderVolume;
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
      thunderAudioRef.current = audio;
    }
  }, [thunderEnabled, thunderVolume]);

  useEffect(() => {
    const drops: RainDrop[] = Array.from({ length: rainIntensity }).map(
      (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: (Math.random() * 1 + 0.5) / rainSpeed,
        opacity: Math.random() * 0.6 + 0.2,
        size:
          Math.random() * (rainDropSize.max - rainDropSize.min) +
          rainDropSize.min,
        delay: Math.random() * 2,
      })
    );
    setRaindrops(drops);
  }, [rainIntensity, rainSpeed, rainDropSize]);

  const triggerLightning = useCallback(() => {
    if (!lightningEnabled) return;

    const newLightning: LightningBolt = {
      id: Date.now(),
      type: "flash",
      intensity: Math.random() * 0.8 + 0.2,
      duration: 200 + Math.random() * 300,
    };

    setLightning(newLightning);

    setTimeout(() => {
      setLightning(null);
    }, newLightning.duration);

    if (thunderEnabled && thunderAudioRef.current) {
      setTimeout(() => {
        if (thunderAudioRef.current) {
          thunderAudioRef.current.currentTime = 0;
          thunderAudioRef.current.play().catch(console.error);
        }
      }, thunderDelay * 1000);
    }

    const nextStrike =
      (lightningFrequency + Math.random() * lightningFrequency) * 1000;
    lightningTimeoutRef.current = setTimeout(triggerLightning, nextStrike);
  }, [lightningEnabled, lightningFrequency, thunderEnabled, thunderDelay]);

  useEffect(() => {
    if (lightningEnabled) {
      const initialDelay = Math.random() * lightningFrequency * 1000;
      lightningTimeoutRef.current = setTimeout(triggerLightning, initialDelay);
    }
    return () => {
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
    };
  }, [lightningEnabled, triggerLightning, lightningFrequency]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {lightningEnabled && lightning && (
        <div className="absolute inset-0 z-10">
          <Lightning
            lightningHue={lightningHue}
            lightningXOffset={lightningXOffset}
            lightningSpeed={lightningSpeed}
            lightningIntensity={lightningIntensity}
            lightningSize={lightningSize}
          />
        </div>
      )}

      {lightning && (
        <div
          className="pointer-events-none absolute inset-0 z-30"
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, ${lightning.intensity}) 0%, rgba(255, 255, 255, 0) 100%)`,
            animation: `lightning-flash ${lightning.duration}ms ease-out forwards`,
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          transform: `rotate(${rainAngle}deg)`,
          transformOrigin: "center center",
        }}
      >
        {raindrops.map(drop => (
          <div
            key={drop.id}
            className="absolute top-[-20px]"
            style={{
              left: `${drop.left}%`,
              width: `${drop.size}px`,
              height: `${drop.size * 10}px`,
              background: `linear-gradient(to bottom, transparent, ${rainColor})`,
              borderRadius: `${drop.size}px`,
              animation: `rain-fall ${drop.animationDuration}s linear infinite`,
              animationDelay: `${drop.delay}s`,
              opacity: drop.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-40 flex h-full items-center justify-center">
        {children}
      </div>

      <style>{`
        @keyframes rain-fall {
          0% { transform: translateY(-20px); }
          100% { transform: translateY(calc(100vh + 20px)); }
        }
        @keyframes lightning-flash {
          0%, 100% { opacity: 0; }
          10%, 30% { opacity: 1; }
          20% { opacity: 0.3; }
          40% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

WeatherEffect.displayName = "WeatherEffect";



// Main Hero Component
export default function App() {
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedCityInput, setSelectedCityInput] = useState("Mumbai");
  const [selectedDate, setSelectedDate] = useState("");
  const [historyView, setHistoryView] = useState<'chart' | 'table' | 'forecast'>('chart');
  const [sevenDayForecastData, setSevenDayForecastData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMLDashboardOpen, setIsMLDashboardOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Gradient Boosting");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchForecast();
  }, []);

  const [savedCities, setSavedCities] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stormTrackerSavedCities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userSettings, setUserSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('stormTrackerSettings');
      return saved ? JSON.parse(saved) : { reduceMotion: false, highContrast: false, colorblindMode: false };
    } catch {
      return { reduceMotion: false, highContrast: false, colorblindMode: false };
    }
  });


  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...userSettings, [key]: value };
    setUserSettings(newSettings);
    localStorage.setItem('stormTrackerSettings', JSON.stringify(newSettings));
  };

  const handleMenuNavigate = (sectionId: string) => {
    if (sectionId === "radar-map") {
      // If details aren't shown, we need to fetch forecast to show the map first
      if (!showDetails) {
        fetchForecast();
      }
      // Wait a tick for rendering, then scroll
      setTimeout(() => {
        const element = document.getElementById("radar-map-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    } else if (sectionId === "ml-dashboard") {
      setIsMLDashboardOpen(true);
    } else {
      console.log(`Navigate to ${sectionId} not implemented yet.`);
    }
  };

  const fetchForecast = async (cityOverride?: string) => {
    const targetCity = cityOverride || selectedCityInput;
    setSelectedCity(targetCity);
    if (cityOverride) setSelectedCityInput(cityOverride);
    
    setLoading(true);
    setShowDetails(true);
    try {
      const cityData = INDIAN_CITIES.find(c => c.city === targetCity);
      const coordinatesQuery = cityData ? `&lat=${cityData.lat}&lng=${cityData.lng}` : '';
      const url = selectedDate 
        ? `http://127.0.0.1:8000/api/forecast/${targetCity}?date=${selectedDate}&model_type=${encodeURIComponent(selectedModel)}${coordinatesQuery}`
        : `http://127.0.0.1:8000/api/forecast/${targetCity}?model_type=${encodeURIComponent(selectedModel)}${coordinatesQuery}`;
      
      const [forecastRes, historyRes, sevenDayRes] = await Promise.all([
        fetch(url),
        fetch(`http://127.0.0.1:8000/api/historical-data/${targetCity}`),
        fetch(`http://127.0.0.1:8000/api/forecast/7-days/${targetCity}?model_type=${encodeURIComponent(selectedModel)}${coordinatesQuery}`)
      ]);
      
      const forecastData = await forecastRes.json();
      const historyData = await historyRes.json();
      const sevenDayData = await sevenDayRes.json();
      
      setForecastData(forecastData);
      setHistoricalData(historyData.history);
      setSevenDayForecastData(sevenDayData.forecast);
    } catch (error) {
      console.error("Error connecting to backend, using local simulation fallback:", error);
      
      // Local simulation fallback
      const cityData = INDIAN_CITIES.find(c => c.city === targetCity);
      const latVal = cityData ? cityData.lat : 19.0760;
      const lngVal = cityData ? cityData.lng : 72.8777;
      const baseRiskLevel = cityData ? cityData.riskLevel : "Low Risk";
      
      // Determine simulated metrics based on the city's base risk level
      let temp = 26 + Math.random() * 10;
      let humidity = 55 + Math.random() * 35;
      let windSpeed = 8 + Math.random() * 20;
      let precip = Math.random() * 10;
      let stormProb = 10 + Math.random() * 75;
      
      if (baseRiskLevel.includes("High")) {
        stormProb = 75 + Math.random() * 20;
        windSpeed += 12;
        precip += 15;
      } else if (baseRiskLevel.includes("Moderate")) {
        stormProb = 40 + Math.random() * 30;
        windSpeed += 5;
        precip += 4;
      } else {
        stormProb = 5 + Math.random() * 25;
      }
      
      const calculatedRisk = stormProb > 75 ? "High Risk" : stormProb > 40 ? "Moderate Risk" : "Low Risk";
      
      const simulatedForecast = {
        temp: `${temp.toFixed(1)}°C`,
        humidity: `${humidity.toFixed(1)}%`,
        wind_speed: `${windSpeed.toFixed(1)} mph`,
        pressure: "1010 hPa",
        latitude: `${latVal.toFixed(4)}° N`,
        longitude: `${lngVal.toFixed(4)}° E`,
        prediction: `Stable patterns typical for ${targetCity}. Storm probability is ${stormProb.toFixed(1)}%. (Client Fallback)`,
        storm_index: calculatedRisk,
        precipitation: `${precip.toFixed(1)} mm`,
        model_used: `${selectedModel} (Client Fallback)`,
        storm_probability: parseFloat(stormProb.toFixed(1)),
        storm_occurred: selectedDate ? (precip > 5.0 || windSpeed > 25.0 ? "Yes" : "No") : "N/A"
      };
      
      // 5 years historical data
      const simulatedHistory = [];
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        simulatedHistory.push({
          year: (currentYear - 5 + i).toString(),
          avg_temp: parseFloat((25 + Math.random() * 9).toFixed(1)),
          avg_humidity: parseFloat((50 + Math.random() * 35).toFixed(1)),
          max_wind_speed: parseFloat((10 + Math.random() * 20).toFixed(1)),
          total_precipitation: parseFloat((60 + Math.random() * 100).toFixed(1)),
          storm_events: Math.floor(Math.random() * 3)
        });
      }
      
      // 7-day forecast
      const simulatedSevenDay = [];
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        const dayStr = nextDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dayTemp = temp + (Math.random() * 4 - 2);
        const dayHum = Math.min(100, Math.max(0, humidity + (Math.random() * 12 - 6)));
        const dayProb = Math.min(100, Math.max(0, stormProb + (Math.random() * 16 - 8)));
        const dayRisk = dayProb > 75 ? "High Risk" : dayProb > 40 ? "Moderate Risk" : "Low Risk";
        
        simulatedSevenDay.push({
          date: dayStr,
          storm_probability: parseFloat(dayProb.toFixed(1)),
          temp: parseFloat(dayTemp.toFixed(1)),
          humidity: parseFloat(dayHum.toFixed(1)),
          risk_level: dayRisk
        });
      }
      
      setForecastData(simulatedForecast);
      setHistoricalData(simulatedHistory);
      setSevenDayForecastData(simulatedSevenDay);
    }
    setLoading(false);
  };

  const generatePDF = async () => {
    const reportElement = document.getElementById('report-container');
    if (!reportElement) return;

    try {
      setIsGeneratingPDF(true);
      
      // Briefly change styles if needed before capture
      const originalBackground = reportElement.style.background;
      // Ensuring capture handles dark theme nicely
      reportElement.style.background = '#0f172a'; 
      
      const imgData = await toJpeg(reportElement, {
        quality: 0.95,
        backgroundColor: '#0f172a',
        pixelRatio: 2
      });

      reportElement.style.background = originalBackground;

      // A4 dimensions: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      // Calculate aspect ratio using the DOM element's dimensions
      const pdfHeight = (reportElement.offsetHeight * pdfWidth) / reportElement.offsetWidth;
      
      pdf.setFillColor('#0f172a');
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), 'F');

      // Add Header
      pdf.setTextColor('#22d3ee');
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(`StormTracker Pro Max`, 15, 20);
      
      pdf.setTextColor('#94a3b8');
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Official Risk Assessment Report - ${selectedCity}`, 15, 28);
      
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 34);

      // Add Image below header
      pdf.addImage(imgData, 'JPEG', 10, 45, pdfWidth - 20, pdfHeight - 20);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor('#64748b');
      pdf.text(`Data generated via ${selectedModel} algorithm`, 15, pdf.internal.pageSize.getHeight() - 10);

      pdf.save(`${selectedCity}_Storm_Risk_Report.pdf`);
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF: " + error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-slate-950">
      
      <MLDashboardModal isOpen={isMLDashboardOpen} onClose={() => setIsMLDashboardOpen(false)} />

      
      {/* Absolute Hamburger Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 right-6 z-[9990] p-3 rounded-full bg-slate-900/50 backdrop-blur-md border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-900/50 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:scale-105"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Side Menu Component */}
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={handleMenuNavigate}
        savedCities={savedCities}
        onCitySelect={(city) => {
          setSelectedCityInput(city);
          setIsMenuOpen(false);
          fetchForecast(city);
        }}
        userSettings={userSettings}
        onUpdateSetting={updateSetting}
      />

      <WeatherEffect
        className={userSettings.highContrast ? "bg-slate-950" : "bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"}
        rainIntensity={userSettings.reduceMotion ? 0 : 200}
        rainSpeed={0.12}
        rainAngle={12}
        lightningEnabled={!userSettings.reduceMotion}
        lightningFrequency={4}
        lightningSpeed={0.9}
        lightningIntensity={1.4}
        lightningSize={1.8}
        lightningHue={200}
        thunderEnabled={true}
        thunderVolume={0.7}
        thunderDelay={1.2}
      >
        <div className="relative z-50 flex flex-col items-center justify-center min-h-screen py-6 px-4 sm:px-6 md:px-8 w-full max-w-[90rem] mx-auto">

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center space-y-1 sm:space-y-2 mb-4 w-full"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
              STORM
            </h1>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent leading-none tracking-tight break-words">
              PREDICTION
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-sm sm:text-base md:text-lg text-slate-300 text-center max-w-3xl mb-6 font-light px-2"
          >
            Real-time meteorological tracking, historical analysis, and severe weather risk assessment across the Indian subcontinent.
          </motion.p>

          {/* Weather Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full max-w-5xl px-4"
          >
            {[
              { icon: Cloud, label: "Cloud Cover", value: "87%" },
              { icon: CloudRain, label: "Precipitation", value: "92%" },
              { icon: Wind, label: "Wind Speed", value: "45 mph" },
              { icon: Zap, label: "Storm Index", value: "High" },
            ].map((stat, index) => {
              const displayValue = forecastData && showDetails ? (
                index === 0 ? "87%" : 
                index === 1 ? (forecastData.precipitation ? forecastData.precipitation : forecastData.humidity) : 
                index === 2 ? forecastData.wind_speed : 
                (index === 3 && forecastData.storm_probability !== undefined ? `${forecastData.storm_index} (${forecastData.storm_probability}%)` : forecastData.storm_index)
              ) : stat.value;

              return (
                <PremiumMetricCard
                  key={index}
                  icon={stat.icon}
                  label={stat.label}
                  value={displayValue}
                  delay={0.8 + (index * 0.1)}
                  trend={index === 3 && typeof displayValue === 'string' && displayValue.includes('High') ? "up" : "neutral"}
                />
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
              <div className="relative flex items-center justify-center">
                <ExpandingSearchDock 
                  onSearch={(query) => fetchForecast(query)} 
                  placeholder="Search city..."
                />
              </div>

              <div className="relative flex items-center gap-2">
                <div className="relative" ref={cityDropdownRef}>
                  <div 
                    onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                    className="px-6 py-3 sm:py-4 bg-slate-800/80 border border-slate-600/50 text-white rounded-full font-medium text-base sm:text-lg cursor-pointer hover:border-cyan-500/50 transition-colors pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500 h-12 sm:h-[56px] flex items-center justify-between min-w-[200px]"
                  >
                    <span className="truncate">
                      {INDIAN_CITIES.find(c => c.city === selectedCityInput)?.city || selectedCityInput}, {' '}
                      <span className="text-slate-300 font-normal">{INDIAN_CITIES.find(c => c.city === selectedCityInput)?.state || ''}</span>
                    </span>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
                      <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isCityDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 w-full min-w-[240px] bg-slate-800 border border-slate-600/50 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col"
                        style={{ bottom: 'calc(100% + 8px)', top: 'auto', maxHeight: '300px' }}
                      >
                        <div className="overflow-y-auto custom-scrollbar flex flex-col">
                          {INDIAN_CITIES.map((cityObj) => (
                            <div
                              key={cityObj.city}
                              onClick={() => {
                                setSelectedCityInput(cityObj.city);
                                setIsCityDropdownOpen(false);
                              }}
                              className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${selectedCityInput === cityObj.city ? 'bg-cyan-900/50 text-cyan-300' : 'text-slate-200 hover:bg-slate-700 hover:text-white'}`}
                            >
                              <span className="font-medium">{cityObj.city}</span> 
                              <span className={`text-sm ${selectedCityInput === cityObj.city ? 'text-cyan-400/70' : 'text-slate-400'}`}>{cityObj.state}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => {
                    const newSaved = savedCities.includes(selectedCityInput)
                      ? savedCities.filter((c: string) => c !== selectedCityInput)
                      : [...savedCities, selectedCityInput];
                    setSavedCities(newSaved);
                    localStorage.setItem('stormTrackerSavedCities', JSON.stringify(newSaved));
                  }}
                  title={savedCities.includes(selectedCityInput) ? "Remove from Saved" : "Save Location"}
                  className="p-3 rounded-full bg-slate-800/80 border border-slate-600/50 hover:border-amber-400/50 hover:bg-amber-400/10 transition-colors group h-12 w-12 sm:h-[56px] sm:w-[56px] flex items-center justify-center shrink-0"
                >
                  <Star className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${savedCities.includes(selectedCityInput) ? 'fill-amber-400 text-amber-400' : 'text-slate-400 group-hover:text-amber-400'}`} />
                </button>
              </div>

              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min="2000-01-01"
                max="2035-12-31"
                className="px-4 py-3 sm:py-4 bg-slate-800/80 border border-slate-600/50 text-slate-300 rounded-full font-medium text-base sm:text-lg cursor-pointer hover:border-cyan-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 w-40"
              />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-4 py-3 sm:py-4 bg-slate-800/80 border border-slate-600/50 text-slate-300 rounded-full font-medium text-base sm:text-lg cursor-pointer hover:border-cyan-500/50 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none min-w-[200px]"
              >
                <option value="Gradient Boosting">Gradient Boosting</option>
                <option value="Random Forest">Random Forest</option>
                <option value="Logistic Regression">Logistic Regression</option>
                <option value="Deep Learning">Deep Learning</option>
              </select>
            <button 
              onClick={() => fetchForecast()}
              className="group relative px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 overflow-hidden whitespace-nowrap h-12 sm:h-[56px] flex items-center justify-center shrink-0"
            >
              {/* Shimmer effect */}
              <span className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              
              {/* Glow effect */}
              <span className="absolute -inset-1 z-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-500" />
              
              <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                {loading ? (
                  <>
                    <Zap className="animate-pulse" /> Fetching...
                  </>
                ) : (
                  <>
                    {selectedDate ? (
                      selectedDate < new Date().toISOString().split('T')[0] ? (
                        <><CloudRain /> Predict Past Date</>
                      ) : (
                        <><CloudRain /> Predict Future Date</>
                      )
                    ) : (
                      <><Zap /> View Live Forecast</>
                    )}
                  </>
                )}
              </span>
            </button>
          </motion.div>

          {/* Details Section */}
          <AnimatePresence mode="wait">
            {showDetails && (
              <motion.div
                key={selectedCity}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`w-full rounded-2xl p-4 md:p-6 mt-6 overflow-hidden text-left ${userSettings.highContrast ? 'bg-slate-950 border-2 border-white shadow-none' : 'bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-900/20'}`}
              >
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <CloudRain className="text-cyan-400" /> {selectedDate ? `Forecast for ${selectedDate}` : 'Live Data'} for {selectedCity}
                  </h3>
                  <div className="flex items-center gap-3">
                    {loading && <div className="animate-pulse text-cyan-400 text-sm font-medium">Updating...</div>}
                    <button
                      onClick={generatePDF}
                      disabled={isGeneratingPDF || loading}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium text-slate-200 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingPDF ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                      ) : (
                        <Download className="w-4 h-4 text-cyan-400" />
                      )}
                      {isGeneratingPDF ? "Generating PDF..." : "Export Report"}
                    </button>
                  </div>
                </div>
              
              <div id="report-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start rounded-xl overflow-hidden p-2">
                {/* Left Column: Forecast Data & Historical Trends */}
                <div className="flex flex-col gap-6">
                  {forecastData ? (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 shadow-inner">
                        
                        {/* Radar Chart Section */}
                        <div className="relative w-full md:w-1/2 h-56 rounded-xl bg-slate-900/50 flex items-center justify-center border border-slate-700/30 overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                          { subject: 'Temp (°C)', value: parseFloat(forecastData.temp) || 0, fullMark: 50 },
                          { subject: 'Humidity (%)', value: parseFloat(forecastData.humidity) || 0, fullMark: 100 },
                          { subject: 'Wind (mph)', value: parseFloat(forecastData.wind_speed) || 0, fullMark: 50 },
                          { subject: 'Precip (mm)', value: parseFloat(forecastData.precipitation) || 0, fullMark: 50 },
                          { subject: 'Risk Level', value: forecastData.storm_index?.includes('High') ? 95 : forecastData.storm_index?.includes('Moderate') ? 50 : 20, fullMark: 100 },
                        ]}>
                          <PolarGrid stroke={userSettings.highContrast ? "#ffffff" : "rgba(148, 163, 184, 0.2)"} />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: userSettings.highContrast ? '#ffffff' : '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                          <Radar name="Metrics" dataKey="value" stroke={userSettings.colorblindMode ? "#fe6100" : "#22d3ee"} strokeWidth={2} fill={userSettings.colorblindMode ? "#fe6100" : "url(#colorRadar)"} fillOpacity={0.5} />
                          <defs>
                            <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                            </linearGradient>
                          </defs>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: userSettings.colorblindMode ? '#fe6100' : 'rgba(6, 182, 212, 0.3)', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                            itemStyle={{ color: userSettings.colorblindMode ? '#fe6100' : '#22d3ee', fontWeight: 'bold' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                        </div>
                        
                        <div className="w-full md:w-1/2 space-y-4">
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Algorithmic Risk Assessment</p>
                            <p className={`text-xl font-bold ${
                              forecastData.storm_index.includes('High') ? 'text-red-400' : 
                              forecastData.storm_index.includes('Moderate') ? 'text-yellow-400' : 'text-emerald-400'
                            }`}>
                              {forecastData.storm_index}
                            </p>
                          </div>
                          {forecastData.storm_occurred && forecastData.storm_occurred !== "N/A" && (
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                              <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Historical Event Outcome</p>
                              <p className={`text-xl font-bold flex items-center gap-2 ${
                                forecastData.storm_occurred === 'Yes' ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                Storm Occurred: {forecastData.storm_occurred === 'Yes' ? 'YES ⛈️' : 'NO ☀️'}
                              </p>
                            </div>
                          )}
                          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                            <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-2">Automated Insight</p>
                            <p className="text-slate-300 text-sm">{forecastData.prediction}</p>
                          </div>
                        </div>
                      </div>

                  {/* Historical Data Section */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold text-white">Historical Data Patterns</h4>
                      <div className="flex bg-slate-900 rounded-lg p-1">
                        <button 
                          onClick={() => setHistoryView('chart')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${historyView === 'chart' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                          Chart
                        </button>
                        <button 
                          onClick={() => setHistoryView('table')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${historyView === 'table' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
                        >
                          Table
                        </button>
                        <button 
                          onClick={() => setHistoryView('forecast')}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${historyView === 'forecast' ? 'bg-red-900/50 text-red-400' : 'text-slate-400 hover:text-white'}`}
                        >
                          7-Day Forecast
                        </button>
                      </div>
                    </div>
                    
                    <div className="h-[250px] w-full">
                      {historyView === 'forecast' ? (
                        sevenDayForecastData && sevenDayForecastData.length > 0 ? (
                          <AnimatedForecastChart data={sevenDayForecastData} userSettings={userSettings} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-900/50 rounded-lg">
                            <p className="text-slate-500">Loading forecast data...</p>
                          </div>
                        )
                      ) : historicalData.length > 0 ? (
                        historyView === 'chart' ? (
                          <AnimatedTrendChart data={historicalData} userSettings={userSettings} />
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                            <table className="w-full text-sm text-left text-slate-300">
                              <thead className="text-xs text-slate-400 uppercase bg-slate-900/80">
                                <tr>
                                  <th className="px-4 py-3">Year</th>
                                  <th className="px-4 py-3">Temp</th>
                                  <th className="px-4 py-3">Humidity</th>
                                  <th className="px-4 py-3">Wind</th>
                                  <th className="px-4 py-3">Storms</th>
                                </tr>
                              </thead>
                              <tbody>
                                {historicalData.map((row, idx) => (
                                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                    <td className="px-4 py-2 font-medium text-cyan-400">{row.year}</td>
                                    <td className="px-4 py-2">{row.avg_temp}°C</td>
                                    <td className="px-4 py-2">{row.avg_humidity}%</td>
                                    <td className="px-4 py-2">{row.max_wind_speed} mph</td>
                                    <td className="px-4 py-2">{row.storm_events}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-slate-900/50 rounded-lg">
                          <p className="text-slate-500">No historical data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-slate-800/50 border border-slate-700/50 rounded-xl animate-pulse">
                      <p className="text-slate-500">Awaiting data...</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Map & History Map Section */}
                <div className="flex flex-col gap-6" id="radar-map-section">
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 shadow-inner relative">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="text-cyan-400" /> Live Radar Focus
                    </h4>
                    <WeatherMap 
                      city={selectedCity} 
                      stormIndex={forecastData?.storm_index || "Low Risk"}
                      precipitation={forecastData ? parseFloat(forecastData.precipitation) : 0}
                    />
                  </div>

                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </WeatherEffect>
    </div>
  );
}
