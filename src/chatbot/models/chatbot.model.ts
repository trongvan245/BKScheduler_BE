export type RequestType = 'query' | 'action' | 'unknown';

export interface ChatRequest {
  userId: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  data?: any;
  status: 'success' | 'error';
}

export interface MessageHistory {
  id: string;
  userId: string;
  text: string;
  textBot?: string;
  response?: string;
  createTime: Date;
}

export interface MessageAnalysis {
    message: string;
    requestType: RequestType;
    event: string;
    data?: any;
}