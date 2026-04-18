FROM node:18-alpine

WORKDIR /app

# Cài đặt thư viện Node.js
COPY package*.json ./
RUN npm install

# Copy code frontend
COPY . .

EXPOSE 5173

# Chạy React (Vite)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]