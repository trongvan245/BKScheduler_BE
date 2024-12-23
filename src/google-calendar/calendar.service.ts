import { Injectable } from "@nestjs/common";
import { group } from "console";
import { google, calendar_v3 } from "googleapis";

@Injectable()
export class GoogleCalendarService {
  private readonly calendar: calendar_v3.Calendar;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.CALENDAR_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: "v3", auth: oauth2Client });
  }

  // summary: data.summary,
  //       description: data.description,
  //       startTime: data.startTime,
  //       endTime: data.endTime,
  //       isComplete: data.isComplete,
  //       type: data.type,
  //       priority: data.priority,
  //       group_id: data.group_id, // Include group_id in the create query
  // List events
  async listEvents(): Promise<
    | {
        id: string;
        summary: string;
        description: string;
        isComplete: boolean;
        type: string;
        priority: number;
        createdTime: string;
        startTime: string;
        endTime: string;
        group_id: string | null;
      }[]
    | []
  > {
    const res = await this.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items.map((event) => {
      return {
        id: event.id,
        summary: event.summary,
        description: event.description,
        isComplete: false,
        type: "google_calendar",
        priority: 1,
        createdTime: event.created,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        group_id: null,
      };
    });

    return events || [];
  }

  // Create an event
  async createEvent(eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    const res = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: eventData,
    });

    return res.data;
  }

  // Update an event
  async updateEvent(eventId: string, eventData: calendar_v3.Schema$Event): Promise<calendar_v3.Schema$Event> {
    const res = await this.calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: eventData,
    });

    return res.data;
  }

  // Delete an event
  async deleteEvent(eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  }
}
