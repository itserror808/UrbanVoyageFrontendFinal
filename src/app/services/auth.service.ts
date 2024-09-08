import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.baseUrl}/api/auth`;
  private currentUserSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isAdminSubject = new BehaviorSubject<boolean>(this.getStoredAdminStatus());

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();



  private userRolesSubject = new BehaviorSubject<string[]>(this.getStoredRoles());

  constructor(private http: HttpClient,private router: Router) {}

  private getStoredAdminStatus(): boolean {
    return JSON.parse(localStorage.getItem('isAdmin') || 'false');
  }

  resetAdminStatus() {
    this.setAdminStatus(false);
  }

  setAdminStatus(isAdmin: boolean) {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
    this.isAdminSubject.next(isAdmin);
  }

  getAdminStatus(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  isAdmin(): boolean {
    return this.getStoredAdminStatus();
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      catchError(error => {
        console.error('Error during registration:', error);
        return throwError(error);
      })
    );
  }

  verifyEmail(email: string, verificationCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, { email, verificationCode });
  }

  login(email: string, password: string, rememberMe: boolean): Observable<any> {
    console.log('Login attempt - Email:', email, 'Remember Me:', rememberMe);
    this.isLoggedInSubject.next(true);
    return this.http.post(`${this.apiUrl}/signin`, { email, password, rememberMe }).pipe(
      tap((response: any) => {
        console.log('Login response received:', response);
        if (response.token) {
          console.log('Token received. Length:', response.token.length);

          // Set token expiration time
          const expirationTime = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
          const expirationDate = new Date(new Date().getTime() + expirationTime);

          // Always store in localStorage, but with different expiration times
          localStorage.setItem('token', response.token);
          localStorage.setItem('tokenExpiration', expirationDate.toISOString());

          console.log('Token stored in localStorage with expiration:', expirationDate);

          this.setUserRoles(response.roles);
          console.log('User roles set:', response.roles);
          this.isLoggedInSubject.next(true);
          console.log('isLoggedInSubject updated to true');
        } else {
          console.warn('No token received in the response');
        }
      }),
      catchError((error) => {
        console.error('Error during login:', error);
        return throwError(error);
      })
    );
  }

  // In AuthService
  setUserRoles(roles: string[] | undefined) {
    const safeRoles = roles || [];
    localStorage.setItem('userRoles', JSON.stringify(safeRoles));
    console.log('Roles stored in localStorage:', safeRoles);
    this.userRolesSubject.next(safeRoles);
  }

  getStoredRoles(): string[] {
    const storedRoles = localStorage.getItem('userRoles');
    return storedRoles ? JSON.parse(storedRoles) : [];
  }

  getUserRoles(): Observable<string[]> {
    return this.userRolesSubject.asObservable();
  }

  hasRole(role: string): Observable<boolean> {
    return this.getUserRoles().pipe(
      map(roles => {
        console.log('Checking for role:', role);
        console.log('User roles:', roles);
        return Array.isArray(roles) && roles.includes(role);
      })
    );
  }



  logout(): Observable<any> {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('userRoles');
    this.setAdminStatus(false);
    this.userRolesSubject.next([]);
    this.isLoggedInSubject.next(false);
    return this.http.post(`${this.apiUrl}/signout`, {});
  }


  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      // Here you should also check if the token is expired
      // You can use the jwtDecode function to check the expiration
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decodedToken.exp > currentTime;
      } catch (error) {
        console.error('Error decoding token:', error);
        return false;
      }
    }
    return false;
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  checkUserExists(email: string, phoneNumber: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/check-user`, { email, phoneNumber }).pipe(
      catchError(error => {
        console.error('Error checking user existence:', error);
        return throwError(error);
      })
    );
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.sub;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }


  // In auth.service.ts
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  isLoading$ = this.isLoadingSubject.asObservable();

  private loadCurrentUser(): void {
    const email = this.getCurrentUserEmail();
    if (email) {
      this.getUserDetails(email).subscribe(
        user => {
          console.log('Full user details:', user);
          if (user && user.roles) {
            console.log('User roles from details:', user.roles);
            if (Array.isArray(user.roles)) {
              this.setUserRoles(user.roles);
            } else {
              console.error('User roles is not an array:', user.roles);
            }
          } else {
            console.error('User roles not found in user details');
          }
          this.currentUserSubject.next(user);
        },
        error => console.error('Error loading user details:', error)
      );
    }
  }


  getCurrentUser(): Observable<any> {
    if (!this.currentUserSubject.getValue()) {
      this.loadCurrentUser();
    }
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserId(): Observable<number | null> {
    const email = this.getCurrentUserEmail();
    if (email) {
      return this.getUserDetails(email).pipe(
        map(user => user ? user.userID : null),
        catchError(error => {
          console.error('Error getting user details:', error);
          return of(null);
        })
      );
    }
    return of(null);
  }

  getUserDetails(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-details?email=${email}`).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(error);
      })
    );
  }

  handleOAuthLogin(token: string): void {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);

    const decodedToken: any = jwtDecode(token);
    console.log('Decoded token:', decodedToken);

    if (decodedToken && Array.isArray(decodedToken.roles)) {
      console.log('Roles from token:', decodedToken.roles);
      this.setUserRoles(decodedToken.roles);
    } else {
      console.error('Roles not found in token or not an array');
    }

    this.loadCurrentUser();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

}
