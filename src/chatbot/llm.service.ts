// src/chatbot/services/llm.service.ts
import { Injectable } from '@nestjs/common';
import { MessageAnalysis, RequestType } from './models/chatbot.model';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeMessage(message: string): Promise<MessageAnalysis> {
    const prompt = `You are a schedule management assistant. Analyze the following message and provide a JSON response with the following structure:
{
  "requestType": "query" or "action",
  "event": "function name",
  "data": {
    // relevant parameters
  }
}

Available Functions:
- create: Create a new schedule event
- update: Update an existing schedule event
- delete: Delete a schedule event
- get: Get specific schedule information
- list: List all schedules

Example 1:
Input: "Create a meeting with John tomorrow at 2 PM"
Output: {
  "requestType": "action",
  "event": "create",
  "data": {
    "type": "meeting",
    "attendee": "John",
    "date": "tomorrow",
    "time": "14:00"
  }
}

Example 2:
Input: "What's my schedule for next week?"
Output: {
  "requestType": "query",
  "event": "list",
  "data": {
    "timeRange": "next week"
  }
}

Example 3:
Input: "Cancel my meeting with Sarah"
Output: {
  "requestType": "action",
  "event": "delete",
  "data": {
    "type": "meeting",
    "attendee": "Sarah"
  }
}

Now analyze this message: "${message}"

Return only the JSON object without any additional text or explanation.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        message,
        ...analysis
      };
    } catch (error) {
      console.error('Error analyzing message:', error);
      // Return a default analysis for unknown messages
      return {
        message,
        requestType: 'unknown',
        event: 'unknown',
        data: {}
      };
    }
  }

  async generateResponse(params: {
    message: string;
    requestType: RequestType;
    serviceResponse: any;
  }): Promise<string> {
    const { message, requestType, serviceResponse } = params;

    const prompt = `You are a helpful schedule management assistant. Generate a natural and friendly response based on the following information:

User Message: "${message}"
Request Type: ${requestType}
Service Response: ${JSON.stringify(serviceResponse)}

Guidelines:
1. For successful actions (create/update/delete):
   - Confirm what was done
   - Include relevant details (time, date, attendees)

2. For queries (get/list):
   - Present the information clearly
   - Include all relevant schedule details

3. Response Style:
   - Be concise but friendly
   - Use natural language
   - Confirm understanding of the request
   - Include relevant details from the service response

Example Responses:
1. For schedule creation:
   "I've scheduled your meeting with John for tomorrow at 2 PM."

2. For schedule queries:
   "Here's your schedule for next week: You have a team meeting on Monday at 10 AM and a client call on Wednesday at 3 PM."

3. For updates:
   "I've updated your meeting with Sarah to start at 3 PM instead of 2 PM."

4. For deletions:
   "I've cancelled your meeting with the team scheduled for tomorrow."

Generate a response using natural language. Do not include any JSON formatting or technical details.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating response:', error);
      return 'I apologize, but I encountered an error processing your request. Please try again.';
    }
  }
}