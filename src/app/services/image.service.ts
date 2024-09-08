import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.baseUrl}/api/background-image`;

  constructor(private http: HttpClient) {}

  getBackgroundImage(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  uploadBackgroundImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  truncateBackgroundImages(): Observable<any> {
    return this.http.post(`${this.apiUrl}/truncate`, {});
  }
}
