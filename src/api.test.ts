import axios from "axios"

axios.defaults.validateStatus = () => true

describe("POST /events", () => {
  test("It should create a new event", async () => {
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date(new Date().setHours(new Date().getHours() + 1)),
      ownerId: crypto.randomUUID(),
    }

    const response = await axios.post("http://localhost:8080/events", input)
    expect(response.status).toBe(201)
    expect(response.data.name).toBe(input.name)
    expect(response.data.ticketPriceInCents).toBe(input.ticketPriceInCents)
    // expect(response.data.latitude).toBe(input.latitude)
    // expect(response.data.longitude).toBe(input.longitude)
    expect(response.data.ownerId).toBe(input.ownerId)
  })
  test("It should return status code 400 if createEvent throw an error", async () => {
    const input = {
      name: "FSC Presencial",
      ticketPriceInCents: 1000,
      latitude: -90,
      longitude: -180,
      date: new Date().setHours(new Date().getHours() + 1),
      ownerId: "invalid-uuid",
    }

    const response = await axios.post("http://localhost:8080/events", input)
    expect(response.status).toBe(400)
  })
})
