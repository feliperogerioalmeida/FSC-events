import { db } from "../db/client.js"
import { eventsTable } from "../db/schema.js"
import { startPostgresTestDb } from "../db/test-db.js"
import { EventRepositoryDrizzle } from "../resources/EventRepository.js"
import { CreateEvent } from "./CreateEvent.js"

describe("Create Event", () => {
  let database: typeof db

  beforeAll(async () => {
    const testDatabase = await startPostgresTestDb()
    database = testDatabase.db
  })

  beforeEach(async () => {
    await database.delete(eventsTable).execute()
  })

  test("It should create a new event", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = await createEvent.execute(input)
    expect(output.id).toBeDefined()
    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(output.ownerId).toBe(input.ownerId)
  })
  test("It should return an error if ownwerId it is not a UUID", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: "invalid-uuid",
    }

    const output = createEvent.execute(input)
    await expect(output).rejects.toThrow(new Error("Invalid ownerId"))
  })
  test("It should return an error if price in cents is negative", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: -200,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)
    await expect(output).rejects.toThrow(new Error("Invalid Ticket Price"))
  })
  test("It should return an error if latitude is invalid", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -100,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)
    await expect(output).rejects.toThrow("Invalid Latitude")
  })
  test("It should return an error if longitude is invalid", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -200,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)
    await expect(output).rejects.toThrow("Invalid Longitude")
  })
  test("It should return an error if date is in the past", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      ownerId: crypto.randomUUID(),
    }

    const output = createEvent.execute(input)
    await expect(output).rejects.toThrow("Date must be in the future")
  })
  test("It should return an error if already exists an event on the same date to the same latitude and longitude", async () => {
    const createEvent = new CreateEvent(new EventRepositoryDrizzle(database))
    const date = new Date(new Date().setHours(new Date().getHours() + 1))

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 2000,
      latitude: -90,
      longitude: -180,
      date,
      ownerId: crypto.randomUUID(),
    }

    const output = await createEvent.execute(input)
    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)

    const output2 = createEvent.execute(input)
    await expect(output2).rejects.toThrow(
      new Error("An event already exists for this date and location")
    )
  })
})
