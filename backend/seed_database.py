from app.database import engine
from app.models import Base
from scrape_historical_data import scrape_weather_data

def seed_database():
    print("Resetting database with real historical meteorological data from Open-Meteo...")
    scrape_weather_data()

if __name__ == "__main__":
    seed_database()
