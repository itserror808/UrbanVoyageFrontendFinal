import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Contact} from "../models/contact.model";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.baseUrl}/api/contacts`;


  constructor(private http: HttpClient) { }

  createContact(contact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.apiUrl, contact);
  }
  getAllMessages(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.apiUrl);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUnreadMessageCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<Contact> {
    if (id === undefined) {
      return throwError(() => new Error('Invalid message ID'));
    }
    return this.http.put<Contact>(`${this.apiUrl}/${id}/mark-as-read`, {});
  }
}
