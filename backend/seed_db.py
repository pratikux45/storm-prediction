import random
from datetime import date, timedelta
from app.database import engine, SessionLocal
from app.models import Base, StormData

# Create the tables
print("Creating tables...")
Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(StormData).first():
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding historical data...")
    cities = ["Mumbai", "Nagpur", "Delhi", "Kolkata", "Chennai", "Bangalore", "Hyderabad"]
    
    city_temps = {
        "Nagpur": 35.0, "Mumbai": 30.0, "Delhi": 38.0, 
        "Kolkata": 34.0, "Chennai": 33.0, "Bangalore": 28.0, "Hyderabad": 32.0
    }
    
    # Let's generate data for the 15th of June for the last 5 years
    current_date = date(2026, 6, 15)
    years = [current_date.replace(year=current_date.year - i) for i in range(5, 0, -1)]

    for city in cities:
        base_temp = city_temps.get(city, 30.0)
        base_humidity = 60.0
        base_wind = 15.0
        
        for y_date in years:
            temp = round(base_temp + random.uniform(-3, 3), 1)
            humidity = round(base_humidity + random.uniform(-15, 25), 1)
            wind = round(base_wind + random.uniform(-5, 20), 1)
            # High humidity + wind + temp = higher precipitation/storms
            precip = round(max(0, (temp-30)*2 + (humidity-50)*0.5 + random.uniform(-10, 20)), 1)
            
            data_point = StormData(
                date=y_date,
                location=city,
                temperature=temp,
                wind_speed=wind,
                precipitation=precip
            )
            db.add(data_point)
            
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
