# Hệ thống phân loại văn bản tiếng Việt
## Vietnamese Text Classification System

Đồ án môn [THỰC TẬP TỐT NGHIỆP] — [UTH]

---

## Thành viên

| Họ tên | MSSV | Phụ trách |
|--------|------|-----------|
| [VÕ Thế Diễn] | [054205009188] | AI Model + Backend API |
| [Đào Văn Duy] | [038205003144] | Frontend + Database |

---

## Mô tả hệ thống

Hệ thống nhận đầu vào là văn bản tiếng Việt và phân loại theo 2 chiều:

**Chiều 1 — Thể loại văn bản** (4 nhãn)
- Hành chính, Báo chí, Mạng xã hội, Quảng cáo

**Chiều 2 — Chủ đề nội dung** (8 nhãn)  
- Công nghệ, Kinh tế, Giáo dục, Giải trí, Đời sống, Y tế, Pháp luật, Thể thao

---

## Công nghệ sử dụng

| Tầng | Công nghệ |
|------|-----------|
| AI Model | PhoBERT (vinai/phobert-base) + PyTorch |
| Tiền xử lý | underthesea |
| Training | Google Colab (GPU T4) |
| Backend | FastAPI + Python 3.11 |
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Database | PostgreSQL + MongoDB |
| Cache | Redis |
| Deploy | Docker + Docker Compose |

---

## Cấu trúc thư mục
```
vietnamese-text-classifier/
├── ai/                        
│   ├── notebooks/
│   │   ├── 01_data_prep.ipynb
│   │   └── 02_train_phobert.ipynb
│   └── src/
│       ├── preprocess.py
│       ├── model.py
│       ├── train.py
│       └── evaluate.py
│
├── backend/                  
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── predict.py
│   │   │   ├── history.py
│   │   │   ├── admin.py
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   ├── classifier.py
│   │   │   └── model_manager.py
│   │   └── models/
│   │       ├── schemas.py
│   │       └── db_models.py
│   ├── tasks/
│   │   └── celery_worker.py
│   └── requirements.txt
│
├── frontend/                  
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Classify.tsx
│   │   │   ├── History.tsx
│   │   │   └── Admin.tsx
│   │   ├── components/
│   │   └── api/
│   │       └── client.ts
│   └── package.json
│
├── database/                
│   ├── postgres/
│   │   └── schema.sql
│   └── mongo/
│       └── indexes.js
│
├── .env.example               # Mẫu biến môi trường
├── docker-compose.yml         # Chạy toàn bộ hệ thống
└── README.md
```

---

## Hướng dẫn cài đặt và chạy

### Yêu cầu

- Python 3.11+
- Node.js 18+
- Docker Desktop
- Git

### Bước 1 — Clone repo
```bash
git clone https://github.com/vothedien/vietnamese.git
cd vietnamese
```

### Bước 2 — Tạo file .env
```bash
cp .env.example .env
# Mở .env và điền các giá trị thật
```

### Bước 3 — Chạy Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
# API chạy tại: http://localhost:8000
# Docs tại:     http://localhost:8000/docs
```

### Bước 4 — Chạy Frontend
```bash
cd frontend
npm install
npm run dev
# Web chạy tại: http://localhost:5173
```

### Bước 5 — Chạy tất cả bằng Docker
```bash
docker-compose up --build
```

---

## API Documentation

Xem file [`docs/api_spec.md`](docs/api_spec.md) để biết đầy đủ các endpoint.

Hoặc chạy backend xong vào: http://localhost:8000/docs

---



### Quy tắc đặt tên commit
```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật tài liệu
refactor: tái cấu trúc code
```

---

