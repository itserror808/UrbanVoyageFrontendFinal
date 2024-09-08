import { Schedule } from './schedule.model';

export interface Route {
  routeID: number;
  departureCity: string;
  arrivalCity: string;
  distance: number;
  duration?: number;
  schedules?: Schedule[];
  boughtTicket: number;
}


