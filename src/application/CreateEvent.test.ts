import { db } from "../db/client.js"
import { eventsTable } from "../db/schema.js"
import { startPostgresTestDb } from "../db/test-db.js"
import { EventRepositoryDrizzle } from "../resources/EventRepository.js"
import { CreateEvent } from "./CreateEvent.js"
import { InvalidOwnerIdError } from "./errors/index.js"

describe("Create Event", () => {
  const makeSut = () => {
    const eventRepository = new EventRepositoryDrizzle(database)
    const sut = new CreateEvent(eventRepository)
    return {
      sut,
      eventRepository,
    }
  }

  let database: typeof db

  beforeAll(async () => {
    const testDatabase = await startPostgresTestDb()
    database = testDatabase.db
  })

  beforeEach(async () => {
    await database.delete(eventsTable).execute()
  })

  test("It should create a new event", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = await sut.execute(input)
    expect(output.id).toBeDefined()
    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)
    expect(output.ownerId).toBe(input.ownerId)
  })
  test("It should return an error if ownwerId it is not a UUID", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: "invalid-uuid",
    }

    const output = sut.execute(input)
    await expect(output).rejects.toThrow(new InvalidOwnerIdError())
  })
  test("It should return an error if price in cents is negative", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: -200,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)
    await expect(output).rejects.toThrow(new Error("Invalid Ticket Price"))
  })
  test("It should return an error if latitude is invalid", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -100,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)
    await expect(output).rejects.toThrow("Invalid Latitude")
  })
  test("It should return an error if longitude is invalid", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -200,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)
    await expect(output).rejects.toThrow("Invalid Longitude")
  })
  test("It should return an error if date is in the past", async () => {
    const { sut } = makeSut()
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() - 2)),
      ownerId: crypto.randomUUID(),
    }

    const output = sut.execute(input)
    await expect(output).rejects.toThrow("Date must be in the future")
  })
  test("It should return an error if already exists an event on the same date to the same latitude and longitude", async () => {
    const { sut } = makeSut()
    const date = new Date(new Date().setHours(new Date().getHours() + 1))

    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 2000,
      latitude: -90,
      longitude: -180,
      date,
      ownerId: crypto.randomUUID(),
    }

    const output = await sut.execute(input)
    expect(output.name).toBe(input.name)
    expect(output.ticketPriceInCents).toBe(input.ticketPriceInCents)

    const output2 = sut.execute(input)
    await expect(output2).rejects.toThrow(
      new Error("An event already exists for this date and location")
    )
  })

  test("it should call repository with all corret parameters", async () => {
    const { sut, eventRepository } = makeSut()
    const spy = vi.spyOn(eventRepository, "create")
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }
    await sut.execute(input)
    expect(spy).toHaveBeenCalledWith({ ...input, id: expect.any(String) })
  })
})
