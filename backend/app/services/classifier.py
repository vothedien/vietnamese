# backend/app/services/classifier.py

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
import torch.nn as nn
import re
from underthesea import word_tokenize

# ── Label mappings ───────────────────────────────────────────
ID2GENRE = {0: "Hành chính", 1: "Báo chí",
            2: "Mạng xã hội", 3: "Quảng cáo"}
ID2TOPIC = {0: "Công nghệ", 1: "Kinh tế", 2: "Giáo dục",
            3: "Giải trí", 4: "Đời sống", 5: "Y tế",
            6: "Pháp luật", 7: "Thể thao"}

# ── Model architecture (ĐÃ SỬA ĐỂ KHỚP VỚI GOOGLE COLAB) ─────
class PhoBERTMultiTask(nn.Module): # Đổi tên class cho giống luôn cũng được
    def __init__(self, num_genres=4, num_topics=8, dropout=0.3):
        super().__init__()
        # 1. Đổi sang V2 giống file train
        self.phobert  = AutoModel.from_pretrained("vinai/phobert-base-v2")
        self.dropout  = nn.Dropout(dropout)
        hidden_size   = self.phobert.config.hidden_size  # 768

        self.genre_classifier = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_genres)
        )
        self.topic_classifier = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_topics)
        )

    def forward(self, input_ids, attention_mask):
        outputs = self.phobert(input_ids=input_ids, attention_mask=attention_mask)
        
        # 2. Sửa thành pooler_output giống hệt lúc train
        pooled_output = outputs.pooler_output
        pooled_output = self.dropout(pooled_output)
        
        return (self.genre_classifier(pooled_output),
                self.topic_classifier(pooled_output))


# ── Classifier Service ───────────────────────────────────────
class ViTextClassifier:
    def __init__(self, model_path: str, device: str = None):
        self.device = device or (
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        print(f"Loading model on {self.device}...")

        # 1. Đổi sang V2 cho tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(
            "vinai/phobert-base-v2"
        )

        # Load model
        self.model = PhoBERTMultiTask() # Dùng class mới
        checkpoint = torch.load(model_path, map_location=self.device)

        # Tuong thich ca 2 kieu luu checkpoint
        state = (checkpoint.get("model_state")
                 or checkpoint.get("model_state_dict")
                 or checkpoint)
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

        print("Model loaded!")

    def clean_text(self, text: str) -> str:
        text = re.sub(r"<[^>]+>",      " ", text)
        text = re.sub(r"https?://\S+", " ", text)
        text = re.sub(r"\s+",          " ", text)
        text = text.strip()
        
        # Tách từ bằng underthesea
        text = word_tokenize(text, format="text") 
        return text

    def predict(self, text: str) -> dict:
        text_clean = self.clean_text(text)

        encoding = self.tokenizer(
            text_clean,
            max_length=256,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )

        input_ids      = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)

        with torch.no_grad():
            g_logits, t_logits = self.model(input_ids, attention_mask)

        g_probs = F.softmax(g_logits, dim=1).squeeze().cpu().numpy()
        t_probs = F.softmax(t_logits, dim=1).squeeze().cpu().numpy()

        g_pred = int(g_probs.argmax())
        t_pred = int(t_probs.argmax())

        return {
            "genre":            ID2GENRE[g_pred],
            "genre_id":         g_pred,
            "genre_confidence": round(float(g_probs[g_pred]), 4),
            "topic":            ID2TOPIC[t_pred],
            "topic_id":         t_pred,
            "topic_confidence": round(float(t_probs[t_pred]), 4),
            "all_genre_probs":  {ID2GENRE[i]: round(float(p), 4)
                                 for i, p in enumerate(g_probs)},
            "all_topic_probs":  {ID2TOPIC[i]: round(float(p), 4)
                                 for i, p in enumerate(t_probs)},
        }

    def predict_batch(self, texts: list[str]) -> list[dict]:
        """Phan loai nhieu van ban cung luc"""
        results = []
        for text in texts:
            results.append(self.predict(text))
        return results


# ── Singleton — chi load model 1 lan duy nhat ───────────────
_classifier = None

def get_classifier() -> ViTextClassifier:
    global _classifier
    if _classifier is None:
        import os
        # 3. Đổi tên file mặc định cần tìm thành best_phobert_multitask.pth
        model_path = os.getenv(
            "MODEL_PATH",
            "../ai/models/best_phobert_multitask.pth" 
        )
        _classifier = ViTextClassifier(model_path)
    return _classifier