import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { AuthResponse, AuthUser, SocialProvider } from './auth.models';

interface SocialLoginPayload {
  externalToken: string;
  email?: string;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey = 'news-auth-session';
  private readonly apiBaseUrl = 'http://localhost:4000/api';

  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private token: string | null = null;
  private isBrowserEnv: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowserEnv = isPlatformBrowser(platformId);
    this.restoreSession();
  }

  get user$(): Observable<AuthUser | null> {
    return this.userSubject.asObservable();
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.getValue();
  }

  get authToken(): string | null {
    return this.token;
  }

  loginWithEmail(email: string, displayName?: string): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/email`, {
      email,
      displayName
    }).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.user)
    );
  }

  loginWithSocial(provider: SocialProvider, payload: SocialLoginPayload): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/auth/social`, {
      provider,
      ...payload
    }).pipe(
      tap((response) => this.persistSession(response)),
      map((response) => response.user)
    );
  }

  logout(): void {
    this.token = null;
    this.userSubject.next(null);
    if (this.isBrowserEnv) {
      localStorage.removeItem(this.storageKey);
    }
  }

  getAuthHeaders(): HttpHeaders {
    if (!this.token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  requireUser(): Observable<AuthUser> {
    const user = this.currentUser;
    if (!user) {
      return throwError(() => new Error('User is not authenticated'));
    }
    return of(user);
  }

  private persistSession(response: AuthResponse): void {
    this.token = response.token;
    this.userSubject.next(response.user);

    if (this.isBrowserEnv) {
      localStorage.setItem(this.storageKey, JSON.stringify(response));
    }
  }

  private restoreSession(): void {
    if (!this.isBrowserEnv) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return;
      }

      const parsed: AuthResponse = JSON.parse(stored);
      this.token = parsed.token;
      this.userSubject.next(parsed.user);
    } catch (error) {
      console.error('Failed to restore auth session', error);
      localStorage.removeItem(this.storageKey);
    }
  }
}
