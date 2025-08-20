import { OnSiteEvent } from "./entities/OnSiteEvents.js"
import { InvalidOwnerIdError } from "./errors/index.js"

interface Input {
  name: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
  ownerId: string
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
  async execute(input: Input) {
    const { name, ticketPriceInCents, latitude, longitude, date, ownerId } =
      input
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        ownerId
      )
    ) {
      throw new InvalidOwnerIdError()
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

    const existentEvent = await this.eventRepository.getByDateLatAndLong({
      date,
      latitude,
      longitude,
    })

    if (existentEvent) {
      throw new Error("An event already exists for this date and location")
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
