from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String)
    join_date = Column(DateTime, default=datetime.datetime.utcnow)

class ClassificationHistory(Base):
    __tablename__ = "history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    mongo_id = Column(String) # ID liên kết sang MongoDB
    genre = Column(String(50))
    topic = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)