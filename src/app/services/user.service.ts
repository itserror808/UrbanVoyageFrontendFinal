// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {User} from "../models/user.model";
import { environment } from '../../environment/environment';


@Injectable({
  providedIn: 'root'
})


export class UserService {
  private apiUrl = `${environment.baseUrl}/api/users'`;


  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }
}
