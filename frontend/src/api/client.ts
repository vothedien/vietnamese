import axios from 'axios';
import type { PredictResponse, PredictRequest } from './types';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const predictApi = {
  // Phân loại thủ công (như cũ)
  classifyText: (data: PredictRequest) => 
    api.post<PredictResponse>('/predict', data),

  // MỚI: Phân loại hàng loạt qua file CSV
  uploadCSV: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    // Yêu cầu Backend trả về file để tải (responseType: 'blob')
    return api.post('/predict-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob', 
    });
  }
};