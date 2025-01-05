import { Injectable, Logger } from "@nestjs/common";
import { MessageHistory, ChatRequest, ChatResponse, MessageAnalysis } from "./models/chatbot.model";
import { MessageService } from "../message/message.service";
import { LLMService } from "./llm.service";
import { RetryService } from "./retry.service";
import { HandleRequestService } from "./handleRequest.service";

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly llmService: LLMService,
    private readonly handleRequestService: HandleRequestService,
    private readonly retryService: RetryService,
  ) {}

  async processRequest(request: ChatRequest): Promise<ChatResponse> {
    const userId = request.userId;
    const message = request.message;

    // Lưu tin nhắn của người dùng vào cơ sở dữ liệu
    const savedMessage = await this.messageService.saveMessage({ userId: userId, text: message });

    let analyzeResult;
    try {
      analyzeResult = await this.llmService.analyzeMessage(userId, message);
      console.log("analyzeResult", analyzeResult);
    } catch (error) {
      this.logger.error(`Error analyzing message: ${error.message}`, error.stack);
      return {
        message: "Tôi xin lỗi, có lỗi xảy ra khi phân tích yêu cầu của bạn. Vui lòng thử lại sau.",
        status: "error",
      };
    }

    if (analyzeResult.messageError) {
      return {
        message: analyzeResult.messageError,
        status: "error",
      };
    }

    let serviceResponse;
    try {
      if (analyzeResult.requestType !== "unknown") {
        serviceResponse = await this.retryService.executeWithRetry(() => this.handleRequest(userId, analyzeResult));
      } else {
        serviceResponse = { messageError: "Tôi không hiểu yêu cầu của bạn." };
      }
    } catch (error) {
      this.logger.error(`Error handling request: ${error.message}`, error.stack);
      return {
        message: "Đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.",
        status: "error",
      };
    }

    if (serviceResponse && serviceResponse.messageError) {
      return {
        message: serviceResponse.messageError,
        status: "error",
      };
    }

    const response = await this.generateResponse(analyzeResult, serviceResponse);

    // Cập nhật tin nhắn với kết quả phân tích và phản hồi
    await this.messageService.updateMessage(savedMessage.id, message, {
      response: response.message,
      textBot: analyzeResult.cleanedMessage,
    });

    return response;
  }

  private async handleRequest(userId: string, request: MessageAnalysis): Promise<any> {
    if (request.domain === "event" && request.requestType === "action") {
      return this.handleRequestService.handleAction(userId, request.action, request.data);
    } else if (request.domain === "event" && request.requestType === "query") {
      return this.handleRequestService.handleQuery(userId, request.action, request.data);
    } else if (request.domain === "group") {
      return this.handleRequestService.handleGroup(userId, request.action, request.data);
    } else {
      return null;
    }
  }

  async getMessageHistory(userId: string, limit?: number): Promise<MessageHistory[]> {
    return this.messageService.getMessageHistory(userId, limit);
  }

  async getMessage(userId: string): Promise<MessageHistory[]> {
    return this.messageService.getMessages(userId);
  }

  async deleteMessage(userId: string, messageId: string): Promise<any> {
    return this.messageService.deleteMessage(userId, messageId);
  }

  private async analyzeRequest(userId: string, message: string): Promise<MessageAnalysis> {
    return this.llmService.analyzeMessage(userId, message);
  }

  private async generateResponse(messageAnalysis: MessageAnalysis, serviceResponse: any): Promise<ChatResponse> {
    const llmResponse = await this.llmService.generateResponse({
      analyzeResult: messageAnalysis,
      serviceResponse,
    });

    return {
      message: llmResponse,
      status: "success",
    };
  }
}
