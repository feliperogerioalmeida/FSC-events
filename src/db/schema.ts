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
  owner_id: uuid().notNull(),
  name: text().notNull(),
  ticket_price_in_cents: integer("ticket_price_in_cents").notNull(),
  latitude: decimal({ precision: 9, scale: 6 }).notNull(),
  longitude: decimal({ precision: 9, scale: 6 }).notNull(),
  date: timestamp({ withTimezone: true }).notNull(),
})
