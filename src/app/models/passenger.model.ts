import {Reservation} from "./reservation.model";

export interface Passenger {
  id?: number;
  reservationId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string; // Change to string to match Java entity
  specialRequests: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  seatType: 'STANDARD' | 'PREMIUM' | 'VIP';
  schedulePrice: number;
  status: 'PENDING' | 'CONFIRMED'| 'CANCELLED'| 'REFUND_APPROVED'| 'REFUND_REJECTED'| 'REFUND_REQUESTED'| 'REFUNDED';

}
