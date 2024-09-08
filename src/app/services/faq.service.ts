import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { FAQ } from '../models/faq.model';
import {map} from "rxjs/operators";
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.baseUrl}/api/faqs`;


  constructor(private http: HttpClient) { }

  getAllFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(this.apiUrl).pipe(
      tap(rawFaqs => console.log('Raw FAQs from backend:', rawFaqs)),
      map(faqs => faqs.map(faq => ({
        ...faq,
        answer: faq.answer || 'No answer provided'
      })))
    );
  }

  getFAQById(id: number): Observable<FAQ> {
    return this.http.get<FAQ>(`${this.apiUrl}/${id}`);
  }


  createFAQ(faq: FAQ): Observable<FAQ> {
    return this.http.post<FAQ>(this.apiUrl, faq);
  }
  updateFAQ(id: number, faq: FAQ): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.apiUrl}/${id}`, faq);
  }

  deleteFAQ(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
