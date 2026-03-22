import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AuthResponse {
  message: string;
  user: any;
  authenticated: boolean;
  error?: string;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated = signal(false);
  private _userEmail = signal<string | null>(null);
  private apiUrl = 'http://localhost:3000/api';

  isAuthenticated = this._isAuthenticated.asReadonly();
  userEmail = this._userEmail.asReadonly();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  async login(email: string, password: string): Promise<boolean> {
    const normalizedEmail = (email || '').trim();
    const normalizedPassword = (password || '').trim();

    if (!normalizedEmail || !normalizedPassword) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
          email: normalizedEmail,
          password: normalizedPassword
        }, { withCredentials: true })
      );

      if (response.authenticated) {
        this._isAuthenticated.set(true);
        this._userEmail.set(normalizedEmail);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      return false;
    }
  }

  async signup(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/signup`, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password: password.trim()
        }, { withCredentials: true })
      );

      if (response.authenticated) {
        this._isAuthenticated.set(true);
        this._userEmail.set(email.trim());
        return { success: true };
      }
      return { success: false };
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Check if email already exists
      if (error.status === 422 && error.error?.errors) {
        const errors = error.error.errors;
        if (errors.some((e: string) => e.includes('Email'))) {
          return { success: false, error: 'Unable to sign up, a user with that email already exists' };
        }
      }
      
      return { success: false, error: 'Unable to sign up. Please try again.' };
    }
  }

  async logout() {
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this._isAuthenticated.set(false);
      this._userEmail.set(null);
      this.router.navigate(['/']);
    }
  }
}

