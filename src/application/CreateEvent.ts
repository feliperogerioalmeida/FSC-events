import { OnSiteEvent } from "./entities/OnSiteEvents.js"
import {
  EventAlreadyExistsError,
  InvalidParameterError,
} from "./errors/index.js"

interface Input {
  name: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
  ownerId: string
}

export interface Output {
  id: string
  ownerId: string
  name: string
  ticketPriceInCents: number
  date: Date
  latitude: number
  longitude: number
}

//Ports
export interface EventRepository {
  create: (input: OnSiteEvent) => Promise<OnSiteEvent>
  getByDateLatAndLong: (params: {
    date: Date
    latitude: number
    longitude: number
  }) => Promise<OnSiteEvent | null>
}
export class CreateEvent {
  constructor(private eventRepository: EventRepository) {}
  async execute(input: Input): Promise<Output> {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      input
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        ownerId
      )
    ) {
      throw new InvalidParameterError("ownerId")
    }

    if (ticketPriceInCents < 0) {
      throw new InvalidParameterError("ticketPriceInCents must be positive")
    }

    if (latitude < -90 || latitude > 90) {
      throw new InvalidParameterError("latitude must be between -90 and 90")
    }

    if (longitude < -180 || longitude > 180) {
      throw new InvalidParameterError("longitude must be between -180 and 180")
    }

    const now = new Date()

    if (date < now) {
      throw new InvalidParameterError("date must be in the future")
    }

    const existentEvent = await this.eventRepository.getByDateLatAndLong({
      date,
      latitude,
      longitude,
    })

    if (existentEvent) {
      throw new EventAlreadyExistsError()
    }

    const event = await this.eventRepository.create({
      id: crypto.randomUUID(),
      name,
      ticketPriceInCents,
      latitude,
      longitude,
      date: new Date(date),
      ownerId,
    })

    return event
  }
}
