import { Injectable } from '@nestjs/common';
import { EventService } from "src/event/event.service";


@Injectable()
export class HandleRequestService {
  constructor(private readonly eventService: EventService) {}

    async handleQuery(event: any, data): Promise<any> {
        return "Success Query";
        //return this.eventService.queryEvent(event, data);
    }

    async handleAction(event: any, data): Promise<any> {
        return "Success Action";
        //return this.eventService.actionEvent(event, data);
    }
}