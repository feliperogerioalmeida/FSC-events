import { db } from "../db/client.js"
import { eventsTable } from "../db/schema.js"
import { startPostgresTestDb } from "../db/test-db.js"
import { EventRepositoryDrizzle } from "../resources/EventRepository.js"
import { InvalidParameterError, NotFoundError } from "./errors/index.js"
import { GetEvent } from "./GetEvent.js"

describe("Get Event", () => {
  const makeSut = () => {
    const eventRepository = new EventRepositoryDrizzle(database)
    const sut = new GetEvent(eventRepository)
    return { sut, eventRepository }
  }

  let database: typeof db

  beforeAll(async () => {
    const testDatabase = await startPostgresTestDb()
    database = testDatabase.db
  })

  beforeEach(async () => {
    await database.delete(eventsTable).execute()
  })

  test("Deve recuperar um evento com sucesso", async () => {
    const eventId = crypto.randomUUID()
    const ownerId = crypto.randomUUID()
    const eventDate = new Date(new Date().setHours(new Date().getHours() + 1))

    // Primeiro cria um evento no banco
    await database.insert(eventsTable).values({
      id: eventId,
      name: "FSC Presencial",
      ticket_price_in_cents: 1000,
      latitude: "-23.5505",
      longitude: "-46.6333",
      date: eventDate,
      owner_id: ownerId,
    })

    const { sut } = makeSut()
    const output = await sut.execute({ eventId })

    expect(output.id).toBe(eventId)
    expect(output.name).toBe("FSC Presencial")
    expect(output.ticketPriceInCents).toBe(1000)
    expect(output.latitude).toBe(-23.5505)
    expect(output.longitude).toBe(-46.6333)
    expect(output.date).toEqual(eventDate)
    expect(output.ownerId).toBe(ownerId)
  })

  test("Deve lançar um erro se o eventId não for um UUID", async () => {
    const { sut } = makeSut()
    const input = {
      eventId: "invalid-uuid",
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidParameterError)
    await expect(sut.execute(input)).rejects.toThrow(
      "Invalid Parameter: eventId"
    )
  })

  test("Deve lançar um erro se o eventId for uma string vazia", async () => {
    const { sut } = makeSut()
    const input = {
      eventId: "",
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidParameterError)
    await expect(sut.execute(input)).rejects.toThrow(
      "Invalid Parameter: eventId"
    )
  })

  test("Deve lançar um erro se o evento não for encontrado", async () => {
    const { sut } = makeSut()
    const nonExistentEventId = crypto.randomUUID()
    const input = {
      eventId: nonExistentEventId,
    }

    await expect(sut.execute(input)).rejects.toThrow(NotFoundError)
    await expect(sut.execute(input)).rejects.toThrow("Event not found")
  })

  test("Deve lançar um erro se o eventId for null", async () => {
    const { sut } = makeSut()
    const input = {
      eventId: null as unknown as string,
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidParameterError)
  })

  test("Deve lançar um erro se o eventId for undefined", async () => {
    const { sut } = makeSut()
    const input = {
      eventId: undefined as unknown as string,
    }

    await expect(sut.execute(input)).rejects.toThrow(InvalidParameterError)
  })
})
