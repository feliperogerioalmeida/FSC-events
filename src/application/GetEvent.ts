import { OnSiteEvent } from "./entities/OnSiteEvents.js"
import { InvalidParameterError, NotFoundError } from "./errors/index.js"

// DTO - Data Transfer Object
interface Input {
  eventId: string
}

// DTO - Data Transfer Object
interface Output {
  id: string
  ownerId: string
  name: string
  ticketPriceInCents: number
  date: Date
  latitude: number
  longitude: number
}

// Port
export interface EventRepository {
  getById: (eventId: string) => Promise<OnSiteEvent | null>
}

export class GetEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(input: Input): Promise<Output> {
    const { eventId } = input

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
        eventId
      )
    ) {
      throw new InvalidParameterError("eventId")
    }

    const event = await this.eventRepository.getById(eventId)

    if (!event) {
      throw new NotFoundError("Event not found")
    }

    return event
  }
}
