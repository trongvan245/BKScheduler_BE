// src/chatbot/services/llm.service.ts
import { Injectable } from "@nestjs/common";
import { MessageAnalysis, RequestType } from "./models/chatbot.model";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageService } from "src/message/message.service";

@Injectable()
export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private readonly messageService: MessageService) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeMessage(userId: string, message: string): Promise<MessageAnalysis> {
    // Lấy lịch sử tin nhắn
    const messageHistory = await this.messageService.getMessageHistory(userId, 5);

    // Chuyển đổi sang định dạng phù hợp cho prompt
    const history = messageHistory
      .map((msg) => [
        {
          role: "user",
          parts: [{ text: msg.textBot }], // Lấy nội dung tin nhắn từ người dùng
        },
        {
          role: "model",
          parts: [{ text: msg.response || "" }], // Lấy nội dung phản hồi từ chatbot, dùng "" nếu không có
        },
      ])
      .flat();

    const classificationPrompt = `
Bạn là một trợ lý AI thông minh, có khả năng quản lý lịch trình và nhóm. Hãy phân tích tin nhắn sau:

Tin nhắn: "${message}"

Nhiệm vụ của bạn:
1. Xác định **lĩnh vực (domain)** của yêu cầu: "event" (lịch trình/sự kiện) hoặc "group" (nhóm) hoặc "unknown" (không xác định).
    - **"event"**: Khi tin nhắn yêu cầu thao tác với **sự kiện/lịch trình** (tạo, cập nhật, xóa, truy vấn sự kiện, đồng bộ lịch).
    - **"group"**: Khi tin nhắn yêu cầu thao tác với **nhóm** (tạo nhóm, thêm/xóa thành viên, cập nhật thông tin nhóm, truy vấn thông tin nhóm).
2. Xác định **loại yêu cầu (requestType)**: "action", "query", hoặc "unknown" 
    - "action": Các hành động tạo, cập nhật, xóa, đồng bộ hóa (đối với domain "event"), hoặc các thao tác với nhóm (đối với domain "group").
    - "query": Các yêu cầu truy vấn thông tin (đối với domain "event").
    - "unknown": Không thể xác định được yêu cầu.
3. Làm sạch tin nhắn bằng cách diễn đạt lại yêu cầu một cách ngắn gọn, rõ ràng, giữ lại thông tin quan trọng và loại bỏ các thông tin không cần thiết.

Trả về kết quả theo định dạng JSON sau:

{
  "domain": "lĩnh vực của yêu cầu",
  "requestType": "loại yêu cầu",
  "cleanedMessage": "tin nhắn đã được làm sạch"
}

**Ví dụ:**

**Tin nhắn:** "Tạo event liên hoan cho nhóm ABC vào 8h tối thứ 4 tuần sau"
**Đầu ra:**
{
  "domain": "event",
  "requestType": "action",
  "cleanedMessage": "Tạo sự kiện liên hoan cho nhóm ABC vào 8h tối thứ 4 tuần sau"
}

**Tin nhắn:** "Thêm user abc@def vào nhóm ABC"
**Đầu ra:**
{
  "domain": "group",
  "requestType": "action",
  "cleanedMessage": "Thêm user abc@def vào nhóm ABC"
}

**Tin nhắn:** "Hiển thị các sự kiện của nhóm review dự án trong tuần này"
**Đầu ra:**
{
    "domain": "event",
    "requestType": "query",
    "cleanedMessage": "Hiển thị các sự kiện của nhóm review dự án trong tuần này"
}

Chỉ trả về đối tượng JSON, không thêm bất kỳ văn bản hay lời giải thích nào khác.
  `;

    const classificationResult = await this.model.generateContent(classificationPrompt);
    console.log(classificationResult);
    const classificationResponse = classificationResult.response;
    const classificationText = classificationResponse.text();

    // Extract JSON from the response
    let domain: "event" | "group" | "unknown" = "unknown";
    let requestType: RequestType = "unknown";
    let cleanedMessage = message; // Giữ nguyên message gốc nếu không phân tích được
    let messageError = undefined;

    const classificationJsonMatch = classificationText.match(/\{[\s\S]*\}/);
    if (!classificationJsonMatch) {
      messageError = "Invalid response format for classification";
    } else {
      const classification = JSON.parse(classificationJsonMatch[0]);
      requestType = classification.requestType;
      cleanedMessage = classification.cleanedMessage;
      domain = classification.domain;
    }

    // Bước 2: Phân tích chi tiết dựa trên loại yêu cầu
    let action = "unknown";
    let data: any = {};

    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const currentTime = now.toISOString().slice(11, 19); // HH:mm:ss
    const currentTimeISO = now.toISOString(); // YYYY-MM-DDTHH:mm:ssZ

    // Tạo biến time
    const time = {
      currentDate: currentDate,
      currentTime: currentTime,
      currentTimeISO: currentTimeISO,
    };
    if (domain === "event") {
      if (requestType === "action") {
        // Bước 3.1.1: Phân tích yêu cầu action
        const actionPrompt = `
        Bạn là một trợ lý quản lý lịch trình thông minh, có khả năng tích hợp với Google Calendar. Hãy phân tích thông tin sau:

Đây là lịch sử hội thoại:
${JSON.stringify(history)}

Thời gian hiện tại: ${JSON.stringify(time)}

Tin nhắn: "${cleanedMessage}"

Tin nhắn trên đã được làm sạch và diễn đạt lại yêu cầu một cách ngắn gọn, rõ ràng.

**Hãy làm theo các bước sau để phân tích tin nhắn:**

**Bước 1:** Xác định xem tin nhắn có đề cập đến một **nhóm cụ thể** hay không (ví dụ: "nhóm ABC", "team dự án", "nhóm review"). Nếu có, xác định ID của nhóm và đặt tên biến là \`groupId\`.

**Bước 2:** Xác định hành động chính mà người dùng muốn thực hiện. Các hành động bao gồm:
  - Tạo sự kiện cá nhân (\`createPersonalEvent\`),
  - Tạo sự kiện nhóm (\`createGroupEvent\`),
  - Cập nhật sự kiện (\`update\`),
  - Xóa sự kiện (\`delete\`),
  - Đồng bộ hóa (\`sync\`).

**Bước 3:** Dựa vào hành động đã xác định, trích xuất các tham số liên quan từ tin nhắn. **Lưu ý:** 
- Tham số \`type\` (loại sự kiện) chỉ chấp nhận các giá trị trong enum sau: \`EVENT\`, \`FOCUS_TIME\`, \`OUT_OF_OFFICE\`, \`WORKING_LOCATION\`, \`TASK\`, \`APPOINTMENT_SCHEDULE\`, \`MEETING\`.
- Nếu không cung cấp, giá trị mặc định của \`type\` là \`EVENT\`.

Các tham số cần trích xuất theo từng hành động:
  - **\`createPersonalEvent\`:**
    - \`summary\` (tóm tắt sự kiện),
    - \`description\` (mô tả),
    - \`startTime\` (thời gian bắt đầu),
    - \`endTime\` (thời gian kết thúc),
    - \`type\` (loại sự kiện),
    - \`priority\` (độ ưu tiên, không bắt buộc).
  - **\`createGroupEvent\`:**
    - Tất cả tham số của \`createPersonalEvent\`, thêm \`groupId\` (ID nhóm, bắt buộc).
  - **\`update\`:**
    - \`eventId\` (ID sự kiện, bắt buộc),
    - Các tham số khác giống \`createPersonalEvent\`.
  - **\`delete\`:**
    - \`eventId\` (ID sự kiện, bắt buộc).
  - **\`sync\`:**
    - Không cần tham số.

**Bước 4:** Chuyển đổi các thời gian trong tin nhắn (nếu có) sang định dạng \`YYYY-MM-DDTHH:mm:ss\`, dựa trên thời gian hiện tại.

**Trả về kết quả cuối cùng theo định dạng JSON:**

{
  "action": "tên hành động",
  "data": {
    // các tham số liên quan
  }
}

**Lưu ý:**
- Nếu hành động là \`update\` hoặc \`delete\`, tham số \`eventId\` là bắt buộc.
- Nếu hành động là \`createGroupEvent\`, tham số \`groupId\` là bắt buộc.
- Tham số \`type\` chỉ được chấp nhận nếu nằm trong enum: \`EVENT\`, \`FOCUS_TIME\`, \`OUT_OF_OFFICE\`, \`WORKING_LOCATION\`, \`TASK\`, \`APPOINTMENT_SCHEDULE\`, \`MEETING\`. Giá trị mặc định là \`EVENT\`.
- Nếu không thể xác định được hành động, trả về:

\`\`\`json
{
  "action": "unknown",
  "data": {}
}
\`\`\`
       `; // Thay bằng prompt cho action
        const actionAnalysisResult = await this.model.generateContent(actionPrompt);
        const actionAnalysisResponse = actionAnalysisResult.response;
        const actionAnalysisText = actionAnalysisResponse.text();
        // Extract JSON
        const actionAnalysisJsonMatch = actionAnalysisText.match(/\{[\s\S]*\}/);
        if (!actionAnalysisJsonMatch) {
          messageError = "Invalid response format for action analysis";
        } else {
          const actionAnalysis = JSON.parse(actionAnalysisJsonMatch[0]);
          action = actionAnalysis.action;
          data = actionAnalysis.data;
          data.userId = userId;
        }
      } else if (requestType === "query") {
        // Bước 3.2.1: Phân tích yêu cầu query
        const queryPrompt = `
      Bạn là một trợ lý quản lý lịch trình thông minh, có khả năng tích hợp với Google Calendar. Hãy phân tích tin nhắn sau:

Đây là lịch sử hội thoại:
  ${JSON.stringify(history)}

Thời gian hiện tại: ${JSON.stringify(time)}

Tin nhắn: '${cleanedMessage}'

Tin nhắn trên đã được làm sạch và diễn đạt lại yêu cầu một cách ngắn gọn, rõ ràng.

Nhiệm vụ của bạn là trích xuất thông tin từ tin nhắn và trả về một đối tượng JSON với cấu trúc như sau:

{
  "action": "tên hành động",
  "data": {
    // các tham số liên quan
  }
}

Các hành động (action) bạn có thể hiểu:

- listAll: Lấy danh sách tất cả sự kiện. Hỗ trợ các tham số lọc (filter), sắp xếp (sort) và phân trang (pagination).
- listUserEvents: Lấy danh sách tất cả sự kiện của người dùng hiện tại. Hỗ trợ các tham số lọc (filter), sắp xếp (sort) và phân trang (pagination).
- listGroupEvents: Lấy danh sách tất cả sự kiện của một nhóm cụ thể. Tham số:
    - 'groupId' (string, bắt buộc): ID của nhóm.
    - Hỗ trợ các tham số lọc (filter), sắp xếp (sort) và phân trang (pagination).
- findById: Tìm sự kiện theo ID. Tham số:
    - 'eventId' (string, bắt buộc): ID của sự kiện cần tìm.

**Chi tiết tham số 'filter', 'sort', 'pagination':**

- **'filter'**: Dùng để lọc kết quả. Chấp nhận các trường sau (có thể dùng nhiều trường cùng lúc):
  - 'summary' (string): Lọc theo tiêu đề (tìm kiếm gần đúng).
  - 'description' (string): Lọc theo mô tả (tìm kiếm gần đúng).
  - 'type' (string): Lọc theo loại sự kiện.
  - 'priority' (number): Lọc theo độ ưu tiên.
  - 'startTime' (string): Lọc theo thời gian bắt đầu (có thể dùng toán tử so sánh như >=, <=). Ví dụ: 'filter: { startTime: { ">=": "2024-01-01T00:00:00" } }'. Nếu người dùng cung cấp thời gian tương đối như "sáng mai", "tuần sau", bạn cần chuyển đổi sang định dạng này dựa trên thời gian hiện tại.
  - 'endTime' (string): Lọc theo thời gian kết thúc (có thể dùng toán tử so sánh). Nếu người dùng cung cấp thời gian tương đối như "sáng mai", "tuần sau", bạn cần chuyển đổi sang định dạng này dựa trên thời gian hiện tại.
  - 'isComplete' (boolean): Lọc theo trạng thái hoàn thành (true/false).
  - 'createdTime' (string): Lọc theo thời gian tạo (có thể dùng toán tử so sánh).
- **'sort'**: Dùng để sắp xếp kết quả.
  - 'field' (string): Tên trường cần sắp xếp (ví dụ: 'startTime', 'priority', 'createdTime').
  - 'order' (string): Thứ tự sắp xếp ('asc' hoặc 'desc').
- **'pagination'**: Dùng để phân trang kết quả.
  - 'page' (number): Số thứ tự trang (bắt đầu từ 1).
  - 'pageSize' (number): Số lượng kết quả trên mỗi trang.

**Lưu ý:**

- Nếu hành động là 'listGroupEvents', tham số 'groupId' bắt buộc phải có.
- Nếu hành động là 'findById', tham số 'eventId' bắt buộc phải có.
- Thời gian cần được định dạng YYYY-MM-DDTHH:mm:ss.
- Nếu không thể xác định được hành động, trả về:
{
  "action": "unknown",
  "data": {}
}
      `; // Thay bằng prompt cho query
        const queryAnalysisResult = await this.model.generateContent(queryPrompt);
        const queryAnalysisResponse = queryAnalysisResult.response;
        const queryAnalysisText = queryAnalysisResponse.text();

        // Extract JSON
        const queryAnalysisJsonMatch = queryAnalysisText.match(/\{[\s\S]*\}/);
        if (!queryAnalysisJsonMatch) {
          messageError = "Invalid response format for query analysis";
        } else {
          const queryAnalysis = JSON.parse(queryAnalysisJsonMatch[0]);
          action = queryAnalysis.action;
          data = queryAnalysis.data;
          data.userId = userId;
        }
      }
    } else if (domain === "group") {
      // Bước 3.3.1: Phân tích yêu cầu group
      const groupPrompt = `
      Bạn là một trợ lý AI, có khả năng quản lý các nhóm người dùng. Hãy phân tích tin nhắn sau:

Đây là lịch sử hội thoại:
  ${JSON.stringify(history)}

Thời gian hiện tại: ${JSON.stringify(time)}

Tin nhắn: '${cleanedMessage}'

Tin nhắn trên đã được làm sạch và diễn đạt lại yêu cầu một cách ngắn gọn, rõ ràng.

Nhiệm vụ của bạn là trích xuất thông tin từ tin nhắn và trả về một đối tượng JSON với cấu trúc như sau:

{
  "action": "tên hành động",
  "data": {
    // các tham số liên quan
  }
}

Các hành động (action) bạn có thể hiểu:

- createGroup: Tạo nhóm mới. Tham số:
    - 'name' (string, bắt buộc): Tên của nhóm.
    - 'description' (string, không bắt buộc): Mô tả nhóm.
- findGroupById: Tìm nhóm theo ID. Tham số:
    - 'groupId' (string, bắt buộc): ID của nhóm cần tìm.
- addUserToGroup: Thêm người dùng vào nhóm. Tham số:
    - 'email' (string, bắt buộc): Email của người dùng cần thêm.
    - 'groupId' (string, bắt buộc): ID của nhóm.
- removeUserFromGroup: Xóa người dùng khỏi nhóm. Tham số:
    - 'email' (string, bắt buộc): Email của người dùng cần xóa.
    - 'groupId' (string, bắt buộc): ID của nhóm.
- findUserGroups: Lấy danh sách các nhóm mà người dùng hiện tại đang tham gia. Không cần tham số.
- listAllGroups: Lấy danh sách tất cả các nhóm. Không cần tham số.
- listGroupMembers: Lấy danh sách thành viên của một nhóm. Tham số:
    - 'groupId' (string, bắt buộc): ID của nhóm.
- updateGroupInfo: Cập nhật thông tin nhóm. Tham số:
    - 'groupId' (string, bắt buộc): ID của nhóm cần cập nhật.
    - 'groupInfo' (object, bắt buộc): Thông tin cập nhật của nhóm.
        - 'name' (string, không bắt buộc): Tên mới của nhóm.
        - 'description' (string, không bắt buộc): Mô tả mới của nhóm.
- deleteGroup: Xóa nhóm. Tham số:
    - 'groupId' (string, bắt buộc): ID của nhóm cần xóa.

**Lưu ý:**

- Nếu hành động là 'createGroup', tham số 'name' bắt buộc phải có.
- Nếu hành động là 'findGroupById', 'addUserToGroup', 'removeUserFromGroup', 'listGroupMembers', 'updateGroupInfo', hoặc 'deleteGroup', tham số 'groupId' bắt buộc phải có.
- Nếu không thể xác định được hành động, trả về:

{
  "action": "unknown",
  "data": {}
}
      `;
      const groupAnalysisResult = await this.model.generateContent(groupPrompt);
      const groupAnalysisResponse = groupAnalysisResult.response;
      const groupAnalysisText = groupAnalysisResponse.text();

      // Extract JSON
      const groupAnalysisJsonMatch = groupAnalysisText.match(/\{[\s\S]*\}/);
      if (!groupAnalysisJsonMatch) {
        messageError = "Invalid response format for group analysis";
      } else {
        const groupAnalysis = JSON.parse(groupAnalysisJsonMatch[0]);
        action = groupAnalysis.action;
        data = groupAnalysis.data;
        data.userId = userId; // Có thể không cần thiết cho tất cả các action của group
      }
    } else {
      messageError = "Xin lỗi, tôi không hiểu yêu cầu của bạn.";
    }

    // Bước 4: Trả về kết quả
    return {
      originalMessage: message,
      requestType,
      cleanedMessage,
      domain,
      action,
      data,
      messageError,
    };
  }

  async generateResponse(params: { analyzeResult: MessageAnalysis; serviceResponse: any }): Promise<string> {
    const { analyzeResult, serviceResponse } = params;
    const { originalMessage, requestType, action, data, domain, messageError } = analyzeResult;
    let prompt = "";

    if (messageError) {
      return messageError; // Ưu tiên trả về thông báo lỗi từ analyzeMessage
    }

    if (requestType === "action" && domain === "event") {
      prompt = `
        Bạn là một trợ lý ảo chuyên nghiệp, có khả năng hỗ trợ người dùng quản lý lịch trình cá nhân và nhóm thông qua Google Calendar.
  
        Dựa vào thông tin sau:
        - Yêu cầu gốc: "${originalMessage}"
        - Hành động: "${action}"
        - Kết quả: ${JSON.stringify(serviceResponse)}
  
        Hãy tạo một câu trả lời tự nhiên, thân thiện và chuyên nghiệp bằng Tiếng Việt cho người dùng.
  
        Lưu ý:
        - Thông báo cho người dùng biết hành động đã được thực hiện thành công hay chưa.
        - Nếu cần thiết, hãy tóm tắt lại thông tin của sự kiện (tiêu đề, thời gian, ID sự kiện,...).
        - Nếu có lỗi xảy ra trong quá trình thực thi, hãy thông báo cho người dùng biết.
      `;
    } else if (requestType === "query" && domain === "event") {
      prompt = `
        Bạn là một trợ lý ảo chuyên nghiệp, có khả năng hỗ trợ người dùng quản lý lịch trình cá nhân và nhóm thông qua Google Calendar.
  
        Dựa vào thông tin sau:
        - Yêu cầu gốc: "${originalMessage}"
        - Hành động: "${action}"
        - Kết quả: ${JSON.stringify(serviceResponse)}
  
        Hãy tạo một câu trả lời tự nhiên, thân thiện và chuyên nghiệp bằng Tiếng Việt cho người dùng.
  
        Lưu ý:
        - Trình bày thông tin rõ ràng, dễ hiểu.
        - Nếu kết quả là danh sách sự kiện, hãy liệt kê các thông tin quan trọng như: tiêu đề, thời gian bắt đầu, thời gian kết thúc.
        - Nếu không tìm thấy kết quả, hãy thông báo cho người dùng biết.
      `;
    } else if (domain === "group") {
      prompt = `
        Bạn là một trợ lý ảo chuyên nghiệp, có khả năng hỗ trợ người dùng quản lý nhóm.
  
        Dựa vào thông tin sau:
        - Yêu cầu gốc: "${originalMessage}"
        - Hành động: "${action}"
        - Kết quả: ${JSON.stringify(serviceResponse)}
  
        Hãy tạo một câu trả lời tự nhiên, thân thiện và chuyên nghiệp bằng Tiếng Việt cho người dùng.
  
        Lưu ý:
        - Thông báo cho người dùng biết hành động đã được thực hiện thành công hay chưa.
        - Nếu cần thiết, hãy tóm tắt lại thông tin của nhóm (tên nhóm, ID nhóm, thành viên,...).
        - Nếu có lỗi xảy ra trong quá trình thực thi, hãy thông báo cho người dùng biết.
      `;
    } else {
      return "Xin lỗi, tôi không hiểu yêu cầu của bạn.";
    }

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
    } catch (error) {
      console.error("Error generating response:", error);
      return "Tôi xin lỗi, nhưng tôi đã gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.";
    }
  }
}
