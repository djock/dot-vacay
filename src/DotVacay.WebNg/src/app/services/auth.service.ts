import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { UserProfile } from '../models/user-profile.model';

interface AuthResponse {
  success: boolean;
  token: string;
  errors?: string[];
}

interface ProfileResponse {
  success: boolean;
  userProfile: UserProfile;  
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
            this.storeKey('token', response.token);
            this.storeKey('email', userData.email);
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
            this.storeKey('token', response.token);
            this.storeKey('email', userData.email);
          }
        })
      );
  }

  private storeKey(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private getKey(key: string): string | null {
    return localStorage.getItem(key);
  }


  getToken(): string | null {
    return this.getKey('token');
  }

  getUserEmail(): string | null {
    return this.getKey('email');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getProfile(): Observable<ProfileResponse> {
    const email = this.getUserEmail();
    return this.apiService.get<ProfileResponse>(`/Auth/getProfile?userEmail=${encodeURIComponent(email || '')}`);
  }
}

