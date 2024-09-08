import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import {Observable, Subject, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Route } from "../models/route.model";
import {Router} from "@angular/router";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = `${environment.baseUrl}/api/routes`;


  constructor(private http: HttpClient , private router: Router) { }

  getRoutes(page: number, size: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${page}&size=${size}`).pipe(
      tap(data => console.log('Raw response:', JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  searchRoutes(departureCity: string, arrivalCity: string, page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (departureCity) {
      params = params.set('departureCity', departureCity);
    }
    if (arrivalCity) {
      params = params.set('arrivalCity', arrivalCity);
    }

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }


  private searchTrigger = new Subject<void>();

  searchTrigger$ = this.searchTrigger.asObservable();

  getRouteById(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, route).pipe(
      catchError(this.handleError)
    );
  }

  updateRoute(route: Route): Observable<Route> {
    return this.http.put<Route>(`${this.apiUrl}/${route.routeID}`, route).pipe(
      catchError(this.handleError)
    );
  }

  deleteRoute(id: number): Observable<any> {
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

  findByDepartureAndArrival(departure: string, arrival: string ): Observable<Route[]> {
    return this.http.get<Route[]>(`${this.apiUrl}/search-route`, {
      params: { departure, arrival }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getTopRoutes(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/top?limit=${limit}`).pipe(
      catchError(this.handleError)
    );
  }
}
