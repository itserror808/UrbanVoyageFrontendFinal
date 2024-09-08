import {Route} from "./route.model";
import { User } from "./user.model";

export interface Reservation {
  reservationID: number;
  userId: number;
  routeId: number;
  route: Route;
  user:User;
  reservationDate: Date;
  status: 'PENDING' | 'CONFIRMED'| 'CANCELLED'| 'REFUND_APPROVED'| 'REFUND_REJECTED'| 'REFUND_REQUESTED'| 'REFUNDED';
  departure: string;
  arrival: string;
  seatType: 'STANDARD' | 'PREMIUM' | 'VIP';
}
