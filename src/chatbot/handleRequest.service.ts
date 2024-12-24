import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';

@Injectable()
export class HandleRequestService {

    constructor(private readonly eventService: EventService) {}
    async handleQuery(event: any, data): Promise<any> {
        return this.eventService.queryEvent(event, data);
    }

    async handleAction(event: any, data): Promise<any> {
        return this.eventService.actionEvent(event, data);
    }
}