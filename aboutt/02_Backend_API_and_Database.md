# 2. Backend API and Database

## The Database (`backend/app/database.py` & `models.py`)
- We use **SQLite**, which stores all data in a single local file (`weather.db`).
- **SQLAlchemy** is our ORM. In `models.py`, we define a class called `StormData`. This class maps exactly to a table in our database.
- The `StormData` model has columns like `location`, `temperature`, `wind_speed`, `precipitation`, etc. 
- When we want to fetch data, we don't write `SELECT * FROM storm_data`. Instead, we write Python code like: `db.query(models.StormData).filter(models.StormData.location == city)`.

## The API Endpoints (`backend/app/main.py`)
FastAPI is used to create the endpoints that our frontend will consume.
There are a few key endpoints:

1. **`GET /api/historical-data/{city}`**: 
   - This endpoint takes the city name, queries the database for all past records of that city, and aggregates them year by year.
   - *Fallback Logic:* If the database has no records for a city, we wrote a fallback mechanism that uses `random.uniform()` to generate realistic simulated historical data so the dashboard never breaks.

2. **`GET /api/forecast/{city}`**:
   - This fetches the *latest* single record for a city.
   - It checks the `wind_speed` and `precipitation` values. If they are above certain thresholds, it sets the `storm_index` (risk level) to "High Risk" or "Moderate Risk".

3. **`POST /api/predict`**:
   - Accepts a JSON body with custom temperature, humidity, and wind speed.
   - It runs our algorithmic mock-ML logic to calculate a storm probability percentage based on how extreme the input values are.

## CORS (Cross-Origin Resource Sharing)
You'll notice `CORSMiddleware` in `main.py`. Because our frontend runs on port `5173` and the backend runs on port `8000`, browsers consider them different "origins". We had to enable CORS so the browser allows the frontend to talk to the backend securely.
