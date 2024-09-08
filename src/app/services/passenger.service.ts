import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Passenger } from '../models/passenger.model';
import {map} from "rxjs/operators";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private apiUrl = `${environment.baseUrl}/api/passengers`;


  constructor(private http: HttpClient) { }

  createPassenger(passenger: Passenger): Observable<Passenger> {
    return this.http.post<Passenger>(this.apiUrl, passenger);
  }


  getPassenger(id: number): Observable<Passenger> {
    return this.http.get<Passenger>(`${this.apiUrl}/${id}`);
  }

  updatePassenger(id: number, passenger: Passenger): Observable<Passenger> {
    return this.http.put<Passenger>(`${this.apiUrl}/${id}`, passenger);
  }

  getPassengersByUserId(userId: number): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(`${this.apiUrl}/user/${userId}`);
  }

  transformPassengerData(data: any[]): Passenger[] {
    return data.map(item => {
      const transformedItem = {
        ...item,
        reservationId: item.reservation ? item.reservation.reservationID : null,
        status: item.reservation && this.isValidStatus(item.reservation.status)
          ? item.reservation.status
          : 'PENDING'
      };
      console.log('Transformed item:', transformedItem);
      return transformedItem;
    });
  }

  private isValidStatus(status: string): status is Passenger['status'] {
    return ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUND_APPROVED', 'REFUND_REJECTED', 'REFUND_REQUESTED', 'REFUNDED'].includes(status);
  }


}
