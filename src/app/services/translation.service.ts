// src/app/services/translation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = new BehaviorSubject<string>('en');
  private apiUrl = `${environment.baseUrl}/api/translate'`;


  constructor(private http: HttpClient) {}

  setLanguage(lang: string) {
    this.currentLang.next(lang);
  }

  getCurrentLang(): Observable<string> {
    return this.currentLang.asObservable();
  }

  translate(text: string, targetLanguage: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { text, targetLanguage: targetLanguage.toUpperCase() });
  }
}
