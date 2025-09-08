import fastifySwagger from "@fastify/swagger"
import fastifySwaggerUi from "@fastify/swagger-ui"
import fastify from "fastify"
import { jsonSchemaTransform, ZodTypeProvider } from "fastify-type-provider-zod"
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod"
import z from "zod/v4"

import { CreateEvent } from "./application/CreateEvent.js"
import {
  EventAlreadyExistsError,
  InvalidParameterError,
  NotFoundError,
} from "./application/errors/index.js"
import { db } from "./db/client.js"
import { EventRepositoryDrizzle } from "./resources/EventRepository.js"

const app = fastify()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

const eventRepositoryDrizzle = new EventRepositoryDrizzle(db)
const createEvent = new CreateEvent(eventRepositoryDrizzle)

await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "FSC Events",
      description: "API for FSC Events",
      version: "1.0.0",
    },
    servers: [
      {
        description: "Local server",
        url: "http://localhost:3000",
      },
    ],
  },
  transform: jsonSchemaTransform,
})

await app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
})

app.withTypeProvider<ZodTypeProvider>().route({
  method: "POST",
  url: "/events",
  schema: {
    tags: ["Events"],
    body: z.object({
      name: z.string(),
      ticketPriceInCents: z.number(),
      latitude: z.number(),
      longitude: z.number(),
      date: z.iso.datetime(),
      ownerId: z.uuid(),
    }),
    response: {
      201: z.object({
        id: z.uuid(),
        name: z.string(),
        ticketPriceInCents: z.number(),
        latitude: z.number(),
        longitude: z.number(),
        date: z.iso.datetime(),
        ownerId: z.uuid(),
      }),
      400: z.object({
        code: z.string(),
        message: z.string(),
      }),

      404: z.object({
        code: z.string(),
        message: z.string(),
      }),
      409: z.object({
        code: z.string(),
        message: z.string(),
      }),
      500: z.object({
        code: z.string(),
        message: z.string(),
      }),
    },
  },
  handler: async (req, res) => {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      req.body

    try {
      const event = await createEvent.execute({
        name,
        ticketPriceInCents,
        latitude,
        longitude,
        date: new Date(date),
        ownerId,
      })
      res.status(201).send({ ...event, date: event.date.toISOString() })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof InvalidParameterError) {
        return res.status(400).send({
          code: error.code,
          message: error.message,
        })
      }

      if (error instanceof NotFoundError) {
        return res.status(404).send({
          code: error.code,
          message: error.message,
        })
      }
      if (error instanceof EventAlreadyExistsError) {
        return res.status(409).send({
          code: error.code,
          message: error.message,
        })
      }
      return res
        .status(500)
        .send({ code: "SERVER_ERROR", message: error.message })
    }
  },
})

await app.ready()

await app.listen({ port: 8080 }, () => {
  console.log("Server is running on port 8080 ")
})
