# backend/app/routers/predict.py
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.models.schemas import PredictRequest, PredictionResult
from app.services.classifier import get_classifier
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db, text_collection # Kết nối song song 2 DB
from app import db_models # Models Postgres đã đổi tên để tránh lỗi
import pandas as pd
import uuid
import datetime
import io

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=dict)
async def predict_single(request: PredictRequest, db: Session = Depends(get_db)):
    """Phân loại 1 văn bản và lưu vào Database"""
    if len(request.text.strip()) < 10:
        raise HTTPException(400, "Van ban qua ngan (toi thieu 10 ky tu)")

    clf = get_classifier()
    result = clf.predict(request.text)
    
    # --- LOGIC LƯU DATABASE MỚI ---
    link_id = str(uuid.uuid4())

    # 1. Lưu vào MongoDB (Văn bản thô)
    mongo_doc = {
        "link_id": link_id,
        "content": request.text,
        "genre": result["genre"],
        "topic": result["topic"],
        "created_at": datetime.datetime.utcnow()
    }
    await text_collection.insert_one(mongo_doc)

    # 2. Lưu vào PostgreSQL (Lịch sử tóm tắt)
    new_history = db_models.ClassificationHistory(
        user_id=1, # Mặc định admin
        mongo_id=link_id,
        genre=result["genre"],
        topic=result["topic"]
    )
    db.add(new_history)
    db.commit()
    # -----------------------------

    return {
        "id": link_id[:8],
        "text": request.text,
        **result,
        "model_version": "v2.0",
        "created_at": datetime.datetime.now().isoformat(),
    }


@router.post("/batch")
async def predict_batch_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Phan loai hang loat tu file CSV và lưu toàn bộ vào Database"""

    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Chi chap nhan file CSV")

    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except:
        try:
            df = pd.read_csv(io.StringIO(content.decode("utf-8-sig")))
        except Exception as e:
            raise HTTPException(400, f"Khong doc duoc file CSV: {e}")

    if "text" not in df.columns:
        raise HTTPException(400, f"File CSV phai co cot 'text'.")

    texts_to_predict = df["text"].astype(str).tolist()
    clf = get_classifier()
    batch_results = clf.predict_batch(texts_to_predict)

    results_formatted = []
    
    # --- LOGIC LƯU DATABASE CHO HÀNG LOẠT ---
    for text, res in zip(texts_to_predict, batch_results):
        current_link_id = str(uuid.uuid4())
        
        # Lưu Mongo (Async)
        await text_collection.insert_one({
            "link_id": current_link_id,
            "content": text,
            "genre": res["genre"],
            "topic": res["topic"],
            "created_at": datetime.datetime.utcnow()
        })
        
        # Lưu Postgres
        new_item = db_models.ClassificationHistory(
            user_id=1,
            mongo_id=current_link_id,
            genre=res["genre"],
            topic=res["topic"]
        )
        db.add(new_item)
        
        results_formatted.append({
            "text": text,
            "genre": res["genre"],
            "topic": res["topic"],
            "genre_confidence": res["genre_confidence"],
            "topic_confidence": res["topic_confidence"],
        })
    
    # Commit một lần cho cả batch để tối ưu tốc độ Postgres
    db.commit()
    # ---------------------------------------

    df_result = pd.DataFrame(results_formatted)
    output = io.StringIO()
    df_result.to_csv(output, index=False, encoding="utf-8-sig")

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=result.csv"}
    )