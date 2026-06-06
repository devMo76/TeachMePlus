import { BOOKING_STATUSES } from '@/lib/constants/roles'

type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['completed', 'no_show', 'cancelled'],
  rejected: [],
  completed: [],
  cancelled: [],
  no_show: [],
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to)
}
