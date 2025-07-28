/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateEvent, EventRepository } from "./CreateEvent.js"

describe("POST /events", () => {
  class EventsRepositoryInMemory implements EventRepository {
    events: any[] = []

    async create(input: any) {
      return input
    }
  }

  const createEvent = new CreateEvent(new EventsRepositoryInMemory())
  test("It should create a new event", async () => {
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
  })
  test("It should return an error if ownwerId it is not a UUID", async () => {
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
})
