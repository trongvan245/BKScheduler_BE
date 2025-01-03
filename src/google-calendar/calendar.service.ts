import { Injectable } from "@nestjs/common";
import { google, calendar_v3 } from "googleapis";
import { PrismaService } from "../prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class GoogleCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getGoogleCalendarClient(userId: string): Promise<calendar_v3.Calendar> {
    // Fetch the user's refresh token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { calendar_refresh_token: true },
    });

    if (!user || !user.calendar_refresh_token) {
      throw new UnauthorizedException("User does not have a valid refresh token.");
    }
    console.log(user.calendar_refresh_token);

    // Set up the OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    console.log("add", user.calendar_refresh_token);
    oauth2Client.setCredentials({ refresh_token: user.calendar_refresh_token });

    // Return the Google Calendar instance
    return google.calendar({ version: "v3", auth: oauth2Client });
  }

  async listEvents(userId: string): Promise<
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
    try {
      const calendar = await this.getGoogleCalendarClient(userId);

      const res = await calendar.events.list({
        calendarId: "primary",
        // timeMin: new Date().toISOString(),
        maxResults: 20,
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
    } catch (error) {
      if (error.response && error.response.status === 401) {
        throw new UnauthorizedException("The refresh token has expired or is invalid");
      }
      throw error;
    }
  }

  // Create an event
  async createEvent(eventData: calendar_v3.Schema$Event, userId: string): Promise<calendar_v3.Schema$Event> {
    //add guest
    const calendar = await this.getGoogleCalendarClient(userId);

    
    const res = await calendar.events.insert({
      calendarId: "primary",
      requestBody: eventData,
    });

    return res.data;
  }

  // Update an event
  async updateEvent(
    eventId: string,
    userId: string,
    eventData: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    const calendar = await this.getGoogleCalendarClient(userId);
    const res = await calendar.events.patch({
      calendarId: "primary",
      eventId,
      requestBody: eventData,
    });

    return res.data;
  }

  // Delete an event
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const calendar = await this.getGoogleCalendarClient(userId);
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  }
}
