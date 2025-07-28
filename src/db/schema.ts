import {
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export const eventsTable = pgTable("events", {
  id: uuid().primaryKey().defaultRandom(),
  ownerId: uuid().notNull(),
  name: text().notNull(),
  ticketPriceInCents: integer("ticket_price_in_cents").notNull(),
  latitude: decimal({ precision: 9, scale: 6 }).notNull(),
  longitude: decimal({ precision: 9, scale: 6 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
})
