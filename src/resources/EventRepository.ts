import { and, eq } from "drizzle-orm"

import { EventRepository } from "../application/CreateEvent.js"
import { OnSiteEvent } from "../application/entities/OnSiteEvents.js"
import { db } from "../db/client.js"
import * as schema from "../db/schema.js"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export class EventRepositoryDrizzle implements EventRepository {
  constructor() {}
  async getByDateLatAndLong(params: {
    date: Date
    latitude: number
    longitude: number
  }): Promise<OnSiteEvent | null> {
    const output = await db.query.eventsTable.findFirst({
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
    const [output] = await db
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
