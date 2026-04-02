import requests
import os

BASE = "http://127.0.0.1:8000"

# Tên file chứa văn bản bạn muốn test
FILE_NAME = "input.txt"

# Test 1: Health check
try:
    r_health = requests.get(f"{BASE}/health")
    print(f"Health: {r_health.json()}")
except requests.exceptions.ConnectionError:
    print("LỖI: Không thể kết nối. Bạn đã bật server Uvicorn ở terminal khác chưa?")
    exit()

print("-" * 40)

# Test 2: Đọc file và Predict
if not os.path.exists(FILE_NAME):
    print(f"LỖI: Không tìm thấy file '{FILE_NAME}'.")
    print(f"Vui lòng tạo file '{FILE_NAME}' trong thư mục backend và nhập chữ vào nhé!")
else:
    # Mở file với encoding="utf-8" để đọc được Tiếng Việt có dấu
    with open(FILE_NAME, "r", encoding="utf-8") as file:
        noidung = file.read().strip()

    if not noidung:
        print(f"File '{FILE_NAME}' đang trống. Vui lòng nhập chữ vào file!")
    else:
        print(f"Đang phân tích đoạn văn:\n'{noidung}'\n")
        print("Đang chờ AI xử lý...")
        
        # Gửi nội dung đọc được lên API
        r = requests.post(f"{BASE}/predict", json={
            "text": noidung
        })
        
        if r.status_code == 200:
            result = r.json()
            print(f"\nKET QUA:")
            print(f"  The loai: {result['genre']} ({result['genre_confidence']:.0%})")
            print(f"  Chu de:   {result['topic']} ({result['topic_confidence']:.0%})")
        else:
            print(f"Lỗi API: {r.status_code} - {r.text}")