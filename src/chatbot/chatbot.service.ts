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
    try {
      const analyzeRequest = await this.analyzeRequest(request.userId, request.message);
      console.log(analyzeRequest);
      let serviceResponse;
      if (analyzeRequest.requestType !== "unknown") {
        serviceResponse = await this.retryService.executeWithRetry(() =>
          this.handleRequest(request.userId, analyzeRequest),
        );
      }

      const response = await this.generateResponse(analyzeRequest, serviceResponse);

      // Save message history
      await this.messageService.saveMessage({
        userId: request.userId,
        text: request.message,
        textBot: analyzeRequest.cleanedMessage,
        response: response.message,
      });

      return response;
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      return {
        message: "I apologize, but I encountered an error processing your request. Please try again.",
        status: "error",
      };
    }
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
