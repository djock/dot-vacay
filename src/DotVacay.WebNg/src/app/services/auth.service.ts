import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';

interface AuthResponse {
  success: boolean;
  token: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) { }

  login(userData: { email: string, password: string }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/Auth/login', userData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.storeToken(response.token);
          }
        })
      );
  }

  register(userData: {
    firstName: string,
    lastName: string,
    email: string,
    password: string
  }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/Auth/register', userData)
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.storeToken(response.token);
          }
        })
      );
  }

  private storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}









