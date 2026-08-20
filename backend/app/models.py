from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base

class StormData(Base):
    __tablename__ = "storm_data" # The name of the table in your database

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    location = Column(String, index=True)
    temperature = Column(Float)  # T2M
    dew_point = Column(Float)    # T2MDEW
    max_temp = Column(Float)     # T2M_MAX
    min_temp = Column(Float)     # T2M_MIN
    relative_humidity = Column(Float) # RH2M
    pressure = Column(Float)     # PS
    wind_speed = Column(Float)   # WS10M
    max_wind_speed = Column(Float) # WS10M_MAX
    wind_direction = Column(Float) # WD10M
    precipitation = Column(Float) # PRECTOTCORR