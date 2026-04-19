from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from motor.motor_asyncio import AsyncIOMotorClient

# 1. Cấu hình PostgreSQL (Lưu dữ liệu cứng)
# Duy nhớ thay 'MAT_KHAU_CUA_DUY' bằng mật khẩu Duy đặt lúc cài Postgres nhé!
# Kiểm tra lại 2 dòng này nhé Duy
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:123456@localhost:5432/classification_db"

MONGO_DETAILS = "mongodb://localhost:27017"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 2. Cấu hình MongoDB (Lưu văn bản thô & kết quả AI)
MONGO_DETAILS = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_DETAILS)
mongo_db = client.ai_data_db
text_collection = mongo_db.get_collection("raw_documents")

# Hàm để các router mượn kết nối
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()