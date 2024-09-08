// src/app/services/oauth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {catchError} from "rxjs/operators";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  private baseUrl = `${environment.baseUrl}`;

  constructor(private http: HttpClient , private authService: AuthService) {}

  initiateGoogleLogin(): void {
    window.location.href = `${this.baseUrl}/oauth2/authorization/google`;
  }

  handleRedirect(token: string): Observable<any> {
    this.authService.handleOAuthLogin(token); // Call this method to update login state
    return this.http.get(`${this.baseUrl}/api/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  loginWithOAuthCode(code: string, state: string): Observable<any> {
    const url = `${this.baseUrl}/oauth/login`;
    return this.http.post<any>(url, { code, state }).pipe(
      catchError((error) => {
        console.error('OAuth login error', error);
        throw error;
      })
    );
  }
}


