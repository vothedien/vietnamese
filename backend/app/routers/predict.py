# backend/app/routers/predict.py

from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import PredictRequest, PredictionResult # Bạn có import PredictionResult nhưng chưa xài ở schema
from app.services.classifier import get_classifier
import pandas as pd
import uuid
from datetime import datetime
import io

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=dict)
async def predict_single(request: PredictRequest):
    """Phan loai 1 van ban"""
    if len(request.text.strip()) < 10:
        raise HTTPException(400, "Van ban qua ngan (toi thieu 10 ky tu)")

    clf    = get_classifier()
    result = clf.predict(request.text)

    return {
        "id":               str(uuid.uuid4())[:8],
        "text":             request.text,
        **result,
        "model_version":    "v2.0", # Cập nhật version theo mô hình mới
        "created_at":       datetime.now().isoformat(),
    }


@router.post("/batch")
async def predict_batch_csv(file: UploadFile = File(...)):
    """Phan loai hang loat tu file CSV"""

    # Kiem tra dinh dang file
    if not file.filename.endswith(".csv"):
        raise HTTPException(400, "Chi chap nhan file CSV")

    # Doc file
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except:
        try:
            df = pd.read_csv(io.StringIO(content.decode("utf-8-sig")))
        except Exception as e:
            raise HTTPException(400, f"Khong doc duoc file CSV: {e}")

    # Kiem tra co cot text
    if "text" not in df.columns:
        raise HTTPException(
            400,
            f"File CSV phai co cot 'text'. Cac cot hien co: {list(df.columns)}"
        )

    # 1. Trích xuất danh sách các text
    texts_to_predict = df["text"].astype(str).tolist()

    # 2. Gọi hàm predict_batch thay vì vòng lặp for ở đây
    clf = get_classifier()
    batch_results = clf.predict_batch(texts_to_predict)

    # 3. Gắn kết quả trả về (chỉ lấy các trường cần thiết)
    results_formatted = []
    for text, res in zip(texts_to_predict, batch_results):
        results_formatted.append({
            "text":             text,
            "genre":            res["genre"],
            "topic":            res["topic"],
            "genre_confidence": res["genre_confidence"],
            "topic_confidence": res["topic_confidence"],
        })

    # Tra ve CSV ket qua
    df_result = pd.DataFrame(results_formatted)
    output    = io.StringIO()
    df_result.to_csv(output, index=False, encoding="utf-8-sig")

    from fastapi.responses import StreamingResponse
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8-sig")),
        media_type="text/csv",
        headers={"Content-Disposition":
                 "attachment; filename=result.csv"}
    )