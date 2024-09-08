// reset-password.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, tap, throwError} from 'rxjs';
import {catchError, map} from "rxjs/operators";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordService {
  private apiUrl = `${environment.baseUrl}/api/reset-password`;

  constructor(private http: HttpClient) {}

  checkEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-email`, { email });
  }


  sendOTP(email: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email }, {
      responseType: 'text',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.status === 200) {
          return response.body || 'OTP sent successfully';
        } else {
          throw new Error('Unexpected response');
        }
      }),
      catchError(error => {
        console.error('Error in sendOTP:', error);
        throw error;
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.getJwtToken()}`);
    return this.http.post('http://localhost:8080/api/reset-password/verify-otp', { email, otp }, { headers, responseType: 'text' });
  }

  private getJwtToken(): string {
    // Retrieve the JWT token from wherever you've stored it (e.g., localStorage)
    return localStorage.getItem('jwtToken') || '';
  }

  resetPassword(email: string, newPassword: string): Observable<string> {
    console.log(`Sending reset password request for email: ${email}`);
    return this.http.post(`${this.apiUrl}`, { email, newPassword }, { responseType: 'text' })
      .pipe(
        tap(
          response => console.log('Reset password response:', response),
          error => console.error('Reset password error:', error)
        )
      );
  }


}
