export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface Booking {
  id: string
  status: BookingStatus
}

export interface BookingWithRelations extends Booking {}

// TODO: Add full Booking interface once DB types are generated.
