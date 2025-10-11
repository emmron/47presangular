import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthError, Session, User } from '@supabase/supabase-js';

import { SupabaseClientService } from './supabase-client.service';
import { AuthUser } from '../models/user.model';

interface LocalSession {
  id: string;
  email?: string;
  fullName?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly LOCAL_STORAGE_KEY = 'trump-tracker-auth';

  private sessionSubject = new BehaviorSubject<Session | null>(null);
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  private localSession: LocalSession | null = null;

  readonly session$: Observable<Session | null> = this.sessionSubject.asObservable();
  readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();

  constructor(private supabase: SupabaseClientService) {
    if (this.supabase.isConfigured) {
      void this.initializeSupabaseSession();
    } else {
      this.restoreLocalSession();
    }
  }

  get currentSession(): Session | null {
    return this.sessionSubject.value;
  }

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get userId(): string | null {
    return this.currentUser?.id ?? null;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  signOut(): Promise<{ error: AuthError | null }> {
    if (this.supabase.isConfigured) {
      return this.supabase.getClient().auth.signOut();
    }

    this.localSession = null;
    this.persistLocalSession();
    this.userSubject.next(null);
    return Promise.resolve({ error: null });
  }

  async signInWithOtp(email: string): Promise<void> {
    if (!email) {
      throw new Error('Email is required for sign-in');
    }

    if (this.supabase.isConfigured) {
      const { error } = await this.supabase.getClient().auth.signInWithOtp({ email, options: { emailRedirectTo: window?.location?.origin } });
      if (error) {
        throw error;
      }
      return;
    }

    this.createLocalSession(email);
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    if (!this.supabase.isConfigured) {
      this.createLocalSession(email);
      return;
    }

    const { data, error } = await this.supabase.getClient().auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    this.setSession(data.session ?? null);
  }

  async signInWithProvider(provider: 'github' | 'google' | 'twitter'): Promise<void> {
    if (!this.supabase.isConfigured) {
      this.createLocalSession(`${provider}-user@example.com`, provider);
      return;
    }

    const { error } = await this.supabase.getClient().auth.signInWithOAuth({ provider });
    if (error) {
      throw error;
    }
  }

  readonly isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user));

  private async initializeSupabaseSession(): Promise<void> {
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      console.error('Failed to initialize Supabase session', error);
    }
    this.setSession(data?.session ?? null);

    client.auth.onAuthStateChange((_event, session) => {
      this.setSession(session);
    });
  }

  private setSession(session: Session | null): void {
    this.sessionSubject.next(session);
    if (session?.user) {
      this.userSubject.next(this.mapUser(session.user));
      this.localSession = null;
      this.persistLocalSession();
    } else {
      this.userSubject.next(null);
    }
  }

  private mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email ?? undefined,
      fullName: user.user_metadata?.['full_name'],
      avatarUrl: user.user_metadata?.['avatar_url'],
      provider: user.app_metadata?.provider
    };
  }

  private createLocalSession(email: string, provider = 'local'): void {
    const localUser: LocalSession = {
      id: `local-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(16)}`,
      email,
      fullName: email,
      createdAt: new Date().toISOString()
    };

    this.localSession = localUser;
    this.persistLocalSession();
    this.userSubject.next({
      id: localUser.id,
      email: localUser.email,
      fullName: localUser.fullName,
      provider,
      isGuest: true
    });
  }

  private restoreLocalSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as LocalSession | null;
      if (!parsed) {
        return;
      }

      this.localSession = parsed;
      this.userSubject.next({
        id: parsed.id,
        email: parsed.email,
        fullName: parsed.fullName,
        provider: 'local',
        isGuest: true
      });
    } catch (error) {
      console.warn('Failed to restore local session', error);
    }
  }

  private persistLocalSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.localSession) {
      window.localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.localSession));
    } else {
      window.localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    }
  }
}
