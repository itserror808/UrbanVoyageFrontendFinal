import {Route} from "./route.model";
import {Reservation} from "./reservation.model";


export interface Schedule {
  duration: any;
  scheduleID: number;
  departureTime: string;
  arrivalTime: string;
  route: {
    routeID: number;
    departureCity: string;
    arrivalCity: string;
    distance: number;
    boughtTicket: number;
  };
  availableSeats: number;
  seatType: 'STANDARD' | 'PREMIUM' | 'VIP';
  schedulePrice: number;
  originalPrice?: number;
  discountPercentage?: number;


  // other fields...
}


