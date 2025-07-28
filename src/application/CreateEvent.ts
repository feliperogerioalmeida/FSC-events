import { OnSiteEvent } from "./entities/OnSiteEvents.js"

interface Input {
  name: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
  ownerId: string
}

export interface EventRepository {
  create: (input: OnSiteEvent) => Promise<OnSiteEvent>
}
export class CreateEvent {
  eventRepository: EventRepository
  constructor(eventRepository: EventRepository) {
    this.eventRepository = eventRepository
  }
  async execute(input: Input) {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      input
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        ownerId
      )
    ) {
      throw new Error("Invalid ownerId")
    }

    if (ticketPriceInCents < 0) {
      throw new Error("Invalid Ticket Price")
    }

    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid Latitude")
    }

    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid Longitude")
    }

    const now = new Date()

    if (date < now) {
      throw new Error("Date must be in the future")
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
