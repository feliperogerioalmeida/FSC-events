import fastify, { FastifyReply, FastifyRequest } from "fastify"

import { CreateEvent } from "./application/CreateEvent.js"
import { db } from "./db/client.js"
import { EventRepositoryDrizzle } from "./resources/EventRepository.js"

const app = fastify()

app.post("/events", async (req: FastifyRequest, res: FastifyReply) => {
  const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
    req.body as {
      name: string
      ticketPriceInCents: number
      latitude: number
      longitude: number
      date: string
      ownerId: string
    }

  try {
    const eventRepositoryDrizzle = new EventRepositoryDrizzle(db)
    const createEvent = new CreateEvent(eventRepositoryDrizzle)
    const event = await createEvent.execute({
      name,
      ticketPriceInCents,
      latitude,
      longitude,
      date: new Date(date),
      ownerId,
    })
    res.status(201).send(event)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return res.status(400).send({ message: error.message })
  }
})

app.listen({ port: 3000 }, () => {
  console.log("Server is running on port 3000 ")
})
