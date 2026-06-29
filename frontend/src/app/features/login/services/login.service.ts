import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserRole } from '../../../shared/types/user.types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    rol: UserRole;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/auth/login';

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, payload);
  }
}
