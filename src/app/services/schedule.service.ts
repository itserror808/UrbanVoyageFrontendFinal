import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Schedule } from "../models/schedule.model";
import {Route} from "../models/route.model";
import {DistanceService} from "./distance.service";
import {PricingService} from "./pricing.service";
import {locations} from "../data/locations.data";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private apiUrl = `${environment.baseUrl}/api/schedules`;


  private discountDates: { [key: string]: number } = {};

  constructor(
    private http: HttpClient,
    private distanceService: DistanceService,
    private pricingService: PricingService
  ) {
    this.generateDiscountDatesForYears();
  }

  private generateDiscountDatesForYears(): void {
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year <= currentYear + 5; year++) {
      this.generateDiscountDatesForYear(year);
    }
  }

  private generateDiscountDatesForYear(year: number): void {
    // Civil holidays (fixed dates)
    this.discountDates[`${year}-01-01`] = 0.15; // New Year
    this.discountDates[`${year}-01-11`] = 0.15; // Independence Anniversary
    this.discountDates[`${year}-05-01`] = 0.15; // Labor Day
    this.discountDates[`${year}-07-30`] = 0.15; // Throne Day
    this.discountDates[`${year}-08-14`] = 0.15; // Oued Eddahab Allegiance Day
    this.discountDates[`${year}-08-20`] = 0.15; // Revolution Day
    this.discountDates[`${year}-08-21`] = 0.15; // King Mohammed VI's Birthday
    this.discountDates[`${year}-11-06`] = 0.15; // Green March Day
    this.discountDates[`${year}-11-18`] = 0.15; // Independence Day

    // Religious holidays (these dates change each year based on the Islamic calendar)
    // You would need to calculate or look up the correct dates for each year
    // This is just a placeholder - you'd need to replace these with accurate calculations
    this.discountDates[`${year}-07-07`] = 0.20; // Islamic New Year (approximate)
    this.discountDates[`${year}-09-15`] = 0.20; // Prophet's Birthday (approximate)
    this.discountDates[`${year}-04-10`] = 0.20; // Eid al-Fitr (approximate, 3 days)
    this.discountDates[`${year}-04-11`] = 0.20;
    this.discountDates[`${year}-04-12`] = 0.20;
    this.discountDates[`${year}-06-17`] = 0.20; // Eid al-Adha (approximate)
  }

  private getDiscountForDate(date: Date): number {
    const dateString = date.toISOString().split('T')[0];
    return this.discountDates[dateString] || 0;
  }

  getSchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(this.apiUrl).pipe(
      map(schedules => schedules.map(schedule => ({
        ...schedule,
        route: schedule.route || {}
      }))),
      catchError(this.handleError)
    );
  }

  getTopSchedules(limit: number = 10): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/top?limit=${limit}`).pipe(
      map(schedules => schedules.map(schedule => ({
        ...schedule,
        route: schedule.route || {}
      }))),
      catchError(this.handleError)
    );
  }


  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getSchedulesByRouteId(routeId: number): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.apiUrl}/route/${routeId}`).pipe(
      catchError(this.handleError)
    );
  }

  addSchedule(schedule: Omit<Schedule, 'scheduleID'>): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}`, schedule);
  }

  updateSchedule(schedule: Schedule): Observable<Schedule> {
    return this.http.put<Schedule>(`${this.apiUrl}/${schedule.scheduleID}`, schedule).pipe(
      catchError(this.handleError)
    );
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 400 && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  updateAvailableSeats(scheduleId: number, newAvailableSeats: number): Observable<Schedule> {
    return this.http.patch<Schedule>(`${this.apiUrl}/${scheduleId}/availableSeats`, { availableSeats: newAvailableSeats });
  }

  generateSchedulesForDay(route: Route, date: Date): Observable<Schedule[]> {
    const schedules: Schedule[] = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Find departure and arrival locations
    const departureLocation = locations.find(loc => loc.name === route.departureCity);
    const arrivalLocation = locations.find(loc => loc.name === route.arrivalCity);

    if (!departureLocation || !arrivalLocation) {
      console.error('Departure or arrival location not found');
      return of([]);
    }

    // Calculate distance
    const distance = this.distanceService.calculateDistance(
      departureLocation.lat, departureLocation.lng,
      arrivalLocation.lat, arrivalLocation.lng
    );

    // Calculate duration in hours (assuming average speed of 80 km/h)
    const durationHours = distance / 80;
    const durationMinutes = Math.round(durationHours * 60);

    for (let i = 0; i < 24; i++) {
      const departureTime = new Date(startOfDay);
      departureTime.setHours(i);

      const arrivalTime = new Date(departureTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + durationMinutes);

      const price = this.pricingService.calculateTicketPrice(distance);
      const discount = this.getDiscountForDate(departureTime);
      const discountedPrice = price * (1 - discount);

      const schedule: Schedule = {
        scheduleID: Math.floor(Math.random() * 1000000), // Temporary ID as number
        route: route,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        availableSeats: 50, // Assuming 50 seats
        schedulePrice: Number(discountedPrice.toFixed(2)),
        originalPrice: Number(price.toFixed(2)),
        discountPercentage: discount > 0 ? discount * 100 : undefined,
        duration: `${Math.floor(durationHours)}:${Math.round((durationHours % 1) * 60).toString().padStart(2, '0')}`,
        seatType: 'STANDARD' // Default seat type
      };

      schedules.push(schedule);
    }

    return of(schedules);
  }

  saveSchedule(schedule: Schedule): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}`, schedule).pipe(
      catchError(this.handleError)
    );
  }

  deleteOtherSchedules(selectedSchedule: Schedule): Observable<any> {
    // In a real implementation, you'd send a request to the backend to delete other schedules
    // For now, we'll just simulate this operation
    console.log('Deleting other schedules except:', selectedSchedule);
    return of(null);
  }




}
