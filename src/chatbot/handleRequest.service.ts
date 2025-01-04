import { Injectable } from "@nestjs/common";
import { EventService } from "../event/event.service";
import { GroupService } from "src/group/group.service";

@Injectable()
export class HandleRequestService {
  constructor(
    private readonly eventService: EventService,
    private readonly groupService: GroupService
  ) {}
  async handleQuery(userId: string, action: string, data: any): Promise<any> {
    return this.eventService.queryEvent(userId, action, data);
  }

  async handleAction(userId: string, action: string, data: any): Promise<any> {
    return this.eventService.actionEvent(userId, action, data);
  }

  async handleGroup(userId: string, action: string, data: any): Promise<any> {
    return this.groupService.chatbotGroupService(userId, action, data);
  }
}
