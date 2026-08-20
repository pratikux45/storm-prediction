# 3. Frontend UI and State Management

## Component Structure (`frontend/src/App.tsx`)
The `App.tsx` file is the main container for our application. 

### State Management (`useState`)
We use React's `useState` hook heavily to manage dynamic data. For example:
- `const [selectedCity, setSelectedCity] = useState("Mumbai");` keeps track of what city the user is currently viewing.
- `const [forecastData, setForecastData] = useState(null);` stores the JSON data we get back from the FastAPI backend.
- `const [loading, setLoading] = useState(false);` lets us know if we are currently waiting for the backend to respond, so we can show a "Fetching..." animation.

### Side Effects (`useEffect`)
We use `useEffect` to handle things outside of the pure UI rendering loop. For example, in the `WeatherEffect` component, we use `useEffect` to initialize the WebGL context for the lightning animation, and to set up timers (`setTimeout`) that randomly trigger lightning flashes.

### The UI Components
We separated the UI into modular components so `App.tsx` doesn't become 5,000 lines long:
1. **`ExpandingSearchDock`**: This is a custom search bar. When you click it, it expands using Framer Motion animations. As you type, it filters the `INDIAN_CITIES` array to suggest cities.
2. **`WeatherMap`**: Uses `react-simple-maps` to render an SVG map of India. We map over our city coordinates and place markers on the map.
3. **`PremiumMetricCard`**: A reusable card component for displaying stats like Wind Speed or Humidity.
4. **`RadarChart` (Recharts)**: We take the specific values from `forecastData` (temperature, humidity, etc.) and pass them into the `RadarChart` component to visually compare the different atmospheric metrics.

### Styling with Tailwind CSS
Instead of writing separate `.css` files, we use Tailwind classes directly in the `className` attribute. 
For example: `className="flex items-center justify-center bg-slate-900 rounded-xl"` creates a flexbox container, centers its children, gives it a dark blue background, and rounds the corners.
