import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import {PaymentService} from "./payment.service";
import {AuthService} from "./auth.service";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = `${environment.baseUrl}/api/reservations`;


  constructor(private http: HttpClient ,private paymentService: PaymentService,private authService:AuthService) { }

  getReservations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(reservations => {
        console.log("ReservationService: Received reservations:", JSON.stringify(reservations, null, 2));
      }),
      catchError(error => {
        console.error("ReservationService: Error fetching reservations:", error);
        return throwError(() => new Error('Something went wrong; please try again later.'));
      })
    );
  }

  updateReservationStatus(reservationID: number, newStatus: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationID}/status`, newStatus).pipe(
      catchError(error => {
        if (error.status === 409) {
          return throwError(() => new Error(error.error));
        } else if (error.status === 400) {
          return throwError(() => new Error(error.error));
        }
        console.error('Error updating reservation status:', error);
        return throwError(() => new Error('Failed to update reservation status'));
      })
    );
  }

  createReservation(reservationDTO: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post<any>(`${this.apiUrl}/create`, reservationDTO).pipe(
      tap(response => console.log('Reservation creation response:', response)),
      catchError(error => {
        console.error('Error creating reservation:', error);
        return throwError(error);
      })
    );
  }



  updateReservationSeatType(reservationID: number, newSeatType: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/${reservationID}/seatType`, newSeatType).pipe(
      catchError(error => {
        if (error.status === 400) {
          return throwError(() => new Error(error.error));
        }
        console.error('Error updating reservation seat type:', error);
        return throwError(() => new Error('Failed to update reservation seat type'));
      })
    );
  }

  deleteReservation(reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reservationId}`).pipe(
      catchError(error => {
        console.error('Error deleting reservation:', error);
        return throwError(() => new Error('Failed to delete reservation'));
      })
    );
  }

  updateReservationSchedule(reservationId: number, newDate: string): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}/schedule`, { newDate });
  }

  requestRefund(reservationId: number): Observable<any> {
    console.log(`Requesting refund for reservation ID: ${reservationId}`);
    return this.paymentService.refundPayment(reservationId);
  }

  getAvailableSeats(routeId: number, departureTime: string): Observable<number> {
    const params = new HttpParams()
      .set('routeId', routeId.toString())
      .set('departureTime', departureTime);
    return this.http.get<number>(`${this.apiUrl}/availableSeats`, { params });
  }


}
