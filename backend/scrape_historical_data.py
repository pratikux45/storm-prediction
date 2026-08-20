import urllib.request
import urllib.error
import json
import time
import datetime
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models import StormData, Base

CITIES_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Nagpur": (21.1458, 79.0882),
    "Delhi": (28.7041, 77.1025),
    "Kolkata": (22.5726, 88.3639),
    "Chennai": (13.0827, 80.2707),
    "Bangalore": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867)
}

def scrape_weather_data():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        # Clear existing data for these cities
        print("Clearing old records from the database...")
        for city in CITIES_COORDS.keys():
            session.query(StormData).filter(StormData.location == city).delete()
        session.commit()

        # Archive range: from Jan 1, 2020 to recently (covers past 5-6 years requested by frontend)
        start_date = "2020-01-01"
        end_date = "2026-06-15"

        for city, (lat, lng) in CITIES_COORDS.items():
            url = (
                f"https://archive-api.open-meteo.com/v1/archive?"
                f"latitude={lat}&longitude={lng}&"
                f"start_date={start_date}&end_date={end_date}&"
                f"daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,"
                f"relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum&timezone=GMT"
            )

            # Retry loop for robust API fetching
            api_data = None
            max_retries = 4
            for attempt in range(max_retries):
                print(f"Scraping weather data for {city} ({lat}, {lng}) from {start_date} to {end_date} (Attempt {attempt+1}/{max_retries})...")
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                try:
                    with urllib.request.urlopen(req, timeout=30) as response:
                        api_data = json.loads(response.read())
                        break
                except urllib.error.HTTPError as e:
                    if e.code == 429:
                        wait_time = (attempt + 1) * 6
                        print(f"Rate limited (429) for {city}. Waiting {wait_time} seconds before retrying...")
                        time.sleep(wait_time)
                    else:
                        print(f"HTTP error for {city}: {e}")
                        break
                except Exception as e:
                    print(f"Unexpected error for {city}: {e}")
                    break

            if not api_data or "daily" not in api_data:
                print(f"Warning: Failed to fetch daily data for {city}")
                continue

            daily = api_data["daily"]
            times = daily["time"]
            temp_mean = daily["temperature_2m_mean"]
            temp_max = daily["temperature_2m_max"]
            temp_min = daily["temperature_2m_min"]
            hum_mean = daily["relative_humidity_2m_mean"]
            wind_max = daily["wind_speed_10m_max"]
            precip_sum = daily["precipitation_sum"]

            records = []
            for i in range(len(times)):
                # Parse date
                date_val = datetime.datetime.strptime(times[i], "%Y-%m-%d").date()

                # Open-Meteo returns wind speed in km/h, convert to mph for the ML models
                wind_speed_val = wind_max[i] * 0.621371 if wind_max[i] is not None else None
                max_wind_speed_val = wind_max[i] * 0.621371 if wind_max[i] is not None else None

                records.append({
                    "date": date_val,
                    "location": city,
                    "temperature": temp_mean[i],
                    "dew_point": None,
                    "max_temp": temp_max[i],
                    "min_temp": temp_min[i],
                    "relative_humidity": hum_mean[i],
                    "pressure": 101.0,  # Default standard sea level pressure baseline in kPa (1010 hPa)
                    "wind_speed": wind_speed_val,
                    "max_wind_speed": max_wind_speed_val,
                    "wind_direction": None,
                    "precipitation": precip_sum[i]
                })

            print(f"Bulk inserting {len(records)} records for {city}...")
            session.bulk_insert_mappings(StormData, records)
            session.commit()
            print(f"Successfully inserted weather data for {city}!")

            # Polite delay between requests to avoid hitting rate limits
            time.sleep(3)

        print("Historical weather database successfully updated with real Indian data!")

    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    scrape_weather_data()
