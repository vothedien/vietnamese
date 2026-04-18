// src/api/types.ts
export interface PredictResponse {
  id: string;
  text: string;
  genre: string;
  genre_id: number;
  genre_confidence: number;
  topic: string;
  topic_id: number;
  topic_confidence: number;
  all_genre_probs: Record<string, number>;
  all_topic_probs: Record<string, number>;
  model_version: string;
  created_at: string;
}

export interface PredictRequest {
  text: string;
}