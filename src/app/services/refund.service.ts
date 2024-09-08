import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RefundService {

  private apiUrl = `${environment.baseUrl}/api/refunds`;

  constructor(private http: HttpClient) {}

  getRefundRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests`);
  }

  approveRefund(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/approve/${requestId}`, {});
  }

  rejectRefund(requestId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reject/${requestId}`, {});
  }
}
