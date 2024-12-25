import { Injectable } from '@nestjs/common';

@Injectable()
export class RetryService {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }
}