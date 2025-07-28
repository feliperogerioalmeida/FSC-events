import { EventRepositoryDrizzle } from "./EventRepository.js"

describe("Event Repository Drizzle", () => {
  test("Should create an event on database", async () => {
    const repository = new EventRepositoryDrizzle()
    const id = crypto.randomUUID()
    const output = await repository.create({
      id,
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    })
    expect(output.id).toBe(id)
  })
})
