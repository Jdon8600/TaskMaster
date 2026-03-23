import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  message: string;
  user: any;
  token?: string;
  authenticated: boolean;
  error?: string;
  errors?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isAuthenticated = signal(false);
  private _userEmail = signal<string | null>(null);
  private _token = signal<string | null>(null);
  private apiUrl = environment.apiUrl;

  isAuthenticated = this._isAuthenticated.asReadonly();
  userEmail = this._userEmail.asReadonly();
  token = this._token.asReadonly();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Load token from localStorage on startup
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this._token.set(storedToken);
      this._isAuthenticated.set(true);
      // You might want to validate the token here (I'll revisit this in the future)
    }
  }

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
        })
      );

      if (response.authenticated && response.token) {
        this._isAuthenticated.set(true);
        this._userEmail.set(normalizedEmail);
        this._token.set(response.token);
        localStorage.setItem('authToken', response.token);
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
        })
      );

      if (response.authenticated && response.token) {
        this._isAuthenticated.set(true);
        this._userEmail.set(email.trim());
        this._token.set(response.token);
        localStorage.setItem('authToken', response.token);
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
    const headers = this.getAuthHeaders();
    if (Object.keys(headers).length > 0) {
      try {
        await firstValueFrom(
          this.http.post(`${this.apiUrl}/logout`, {}, { headers })
        );
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    this._isAuthenticated.set(false);
    this._userEmail.set(null);
    this._token.set(null);
    localStorage.removeItem('authToken');
    this.router.navigate(['/']);
  }

  private getAuthHeaders(): { [key: string]: string } {
    const token = this._token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

