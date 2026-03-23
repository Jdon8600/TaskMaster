import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpClientSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    localStorage.clear();

    httpClientSpy = {
      post: vi.fn()
    };
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should return true on successful login', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const mockResponse = { authenticated: true, user: {}, message: 'Logged in', token: 'jwt-token' };

      httpClientSpy.post.mockReturnValue(of(mockResponse));

      const result = service.login(email, password);

      expect(httpClientSpy.post).toHaveBeenCalledWith('http://localhost:3000/api/login', { email, password });
      expect(await result).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.userEmail()).toBe(email);
    });

    it('should return false on failed login', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockResponse = { authenticated: false, message: 'Invalid credentials' };

      httpClientSpy.post.mockReturnValue(of(mockResponse));

      const result = service.login(email, password);

      expect(await result).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.userEmail()).toBe(null);
    });

    it('should return false on empty email or password', async () => {
      expect(await service.login('', 'password')).toBe(false);
      expect(await service.login('email', '')).toBe(false);
      expect(await service.login(' ', 'password')).toBe(false);
      expect(await service.login('email', ' ')).toBe(false);
    });

    it('should return false on HTTP error', async () => {
      const email = 'test@example.com';
      const password = 'password';

      httpClientSpy.post.mockReturnValue(throwError(() => new Error('network error')));

      const result = service.login(email, password);

      expect(await result).toBe(false);
    });
  });

  describe('signup', () => {
    it('should return success on successful signup', async () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john@example.com';
      const password = 'password';
      const mockResponse = { authenticated: true, user: {}, message: 'Signed up', token: 'jwt-token' };

      httpClientSpy.post.mockReturnValue(of(mockResponse));

      const result = service.signup(firstName, lastName, email, password);

      expect(httpClientSpy.post).toHaveBeenCalledWith('http://localhost:3000/api/signup', { firstName, lastName, email, password });
      expect((await result).success).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.userEmail()).toBe(email);
    });

    it('should return failure on signup error', async () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john@example.com';
      const password = 'password';

      httpClientSpy.post.mockReturnValue(throwError(() => new Error('network error')));

      const result = service.signup(firstName, lastName, email, password);

      expect((await result).success).toBe(false);
      expect((await result).error).toBe('Unable to sign up. Please try again.');
    });

    it('should return specific error for duplicate email', async () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'existing@example.com';
      const password = 'password';

      const errorResponse = { status: 422, error: { errors: ['Email has already been taken'] } };
      httpClientSpy.post.mockReturnValue(throwError(() => errorResponse));

      const result = service.signup(firstName, lastName, email, password);

      expect((await result).success).toBe(false);
      expect((await result).error).toBe('Unable to sign up, a user with that email already exists');
    });
  });

  describe('logout', () => {
    it('should clear authentication state and navigate to home', async () => {
      service['_isAuthenticated'].set(true);
      service['_userEmail'].set('test@example.com');
      service['_token'].set('jwt-token');

      httpClientSpy.post.mockReturnValue(of({}));

      await service.logout();

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/logout',
        {},
        { headers: { Authorization: 'Bearer jwt-token' } }
      );
      expect(service.isAuthenticated()).toBe(false);
      expect(service.userEmail()).toBe(null);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should clear state even on logout error', async () => {
      service['_isAuthenticated'].set(true);
      service['_userEmail'].set('test@example.com');
      service['_token'].set('jwt-token');

      httpClientSpy.post.mockReturnValue(throwError(() => new Error('network error')));

      await service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.userEmail()).toBe(null);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});