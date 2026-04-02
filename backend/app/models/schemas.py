# backend/app/models/schemas.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=10,
                      example="VN-Index tăng mạnh hôm nay...")

class PredictionResult(BaseModel):
    id:                 str
    text:               str
    genre:              str
    genre_id:           int
    genre_confidence:   float
    topic:              str
    topic_id:           int
    topic_confidence:   float
    all_genre_probs:    dict
    all_topic_probs:    dict
    model_version:      str
    created_at:         datetime

class BatchStatusResponse(BaseModel):
    job_id:     str
    status:     str   # processing | done | failed
    total:      int
    processed:  int
    download_url: Optional[str] = None

class HistoryItem(BaseModel):
    id:                 str
    text:               str
    genre:              str
    topic:              str
    genre_confidence:   float
    topic_confidence:   float
    is_corrected:       bool
    created_at:         datetime

class CorrectLabelRequest(BaseModel):
    genre: str
    topic: str
    note:  Optional[str] = ""