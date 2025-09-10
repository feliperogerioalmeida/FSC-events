import { and, eq } from "drizzle-orm"

import { EventRepository } from "../application/CreateEvent.js"
import { OnSiteEvent } from "../application/entities/OnSiteEvents.js"
import { EventRepository as GetEventRepository } from "../application/GetEvent.js"
import { db } from "../db/client.js"
import * as schema from "../db/schema.js"

export class EventRepositoryDrizzle
  implements EventRepository, GetEventRepository
{
  constructor(private database: typeof db) {}

  async getById(eventId: string): Promise<OnSiteEvent | null> {
    const output = await this.database.query.eventsTable.findFirst({
      where: eq(schema.eventsTable.id, eventId),
    })
    if (!output) {
      return null
    }
    return {
      date: output.date,
      id: output.id,
      longitude: Number(output.longitude),
      latitude: Number(output.latitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    }
  }

  async getByDateLatAndLong(params: {
    date: Date
    latitude: number
    longitude: number
  }): Promise<OnSiteEvent | null> {
    const output = await this.database.query.eventsTable.findFirst({
      where: and(
        eq(schema.eventsTable.date, params.date),
        eq(schema.eventsTable.latitude, params.latitude.toString()),
        eq(schema.eventsTable.longitude, params.longitude.toString())
      ),
    })

    if (!output) {
      return null
    }
    return {
      date: output?.date,
      id: output?.id,
      latitude: Number(output?.latitude),
      longitude: Number(output?.longitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    }
  }

  async create(input: OnSiteEvent): Promise<OnSiteEvent> {
    const [output] = await this.database
      .insert(schema.eventsTable)
      .values({
        // @ts-expect-error - drizzle
        id: input.id,
        date: input.date,
        name: input.name,
        ticket_price_in_cents: input.ticketPriceInCents,
        latitude: input.latitude,
        longitude: input.longitude,
        owner_id: input.ownerId,
      })
      .returning()
    return {
      date: output.date,
      id: output.id,
      latitude: Number(output.latitude),
      longitude: Number(output.longitude),
      name: output.name,
      ownerId: output.owner_id,
      ticketPriceInCents: output.ticket_price_in_cents,
    }
  }
}
