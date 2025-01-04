export type RequestType = "query" | "action" | "group" | "unknown";

export interface ChatRequest {
  userId: string;
  message: string;
}

export interface ChatResponse {
  message: string;
  data?: any;
  status?: "success" | "error";
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
  originalMessage: string; // Tin nhắn gốc từ người dùng
  requestType: RequestType;
  cleanedMessage: string; // Tin nhắn đã được clean
  domain: "event" | "group" | "unknown";
  action: string;
  data?: any;
  messageError?: string;
}
