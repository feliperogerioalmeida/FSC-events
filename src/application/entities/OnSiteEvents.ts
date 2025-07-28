export interface OnSiteEvent {
  id: string
  ownerId: string
  name: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
}
