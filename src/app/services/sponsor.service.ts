import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Sponsor} from "../models/sponsor.model";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private apiUrl = `${environment.baseUrl}/api/sponsors`;


  constructor(private http: HttpClient) { }

  getSponsors(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(this.apiUrl);
  }

  createSponsor(sponsor: Sponsor): Observable<Sponsor> {
    return this.http.post<Sponsor>(this.apiUrl, sponsor);
  }

  updateSponsor(id: number, sponsor: Sponsor): Observable<Sponsor> {
    return this.http.put<Sponsor>(`${this.apiUrl}/${id}`, sponsor);
  }

  deleteSponsor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
