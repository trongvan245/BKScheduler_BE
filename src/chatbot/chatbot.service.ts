import { Injectable, Logger } from '@nestjs/common';
import { RequestType, ChatRequest, ChatResponse, MessageAnalysis} from './models/chatbot.model';
import { QueryService } from './query.service';
import { ActionService } from './action.service';
import { MessageService } from '../message/message.service';
import { LLMService } from './llm.service';
import { RetryService } from './retry.service';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly queryService: QueryService,
    private readonly actionService: ActionService,
    private readonly messageService: MessageService,
    private readonly llmService: LLMService,
    private readonly retryService: RetryService,
  ) {}

  async processRequest(request: ChatRequest): Promise<ChatResponse> {
    try {
      const analyzeRequest =  await this.analyzeRequest(request.message);

      let serviceResponse;
      if (analyzeRequest.requestType !== 'unknown') {
        serviceResponse = await this.retryService.executeWithRetry(() =>
          this.handleRequest(analyzeRequest)
        );
      }

      const response = await this.generateResponse(
        analyzeRequest,
        serviceResponse,
      );

      // Save message history
      await this.messageService.saveMessage({
        userId: request.userId,
        text: request.message,
        textBot: analyzeRequest.message,
        response: response.message
      });

      return response;
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`);
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        status: 'error',
      };
    }
  }

  private async handleRequest(
    request: MessageAnalysis,

  ): Promise<any> {
    switch (request.requestType) {
      case 'query':
        return this.queryService.handleQuery(request.event);
      case 'action':
        return this.actionService.handleAction(request.event);
      default:
        throw new Error('Unsupported request type');
    }
  }

  async getMessageHistory(userId: string, limit?: number): Promise<MessageHistory[]> {
    return this.messageService.getMessageHistory(userId, limit);
  }

  private async analyzeRequest(message: string): Promise<MessageAnalysis> {
    return this.llmService.analyzeMessage(message);
  }

  private async generateResponse(
    request: MessageAnalysis,
    serviceResponse: any,
  ): Promise<ChatResponse> {
    const llmResponse = await this.llmService.generateResponse({
      message: request.message,
      requestType: request.requestType,
      serviceResponse
    });

    return {
      message: llmResponse,
      data: serviceResponse,
      status: 'success',
    };
  }
}
