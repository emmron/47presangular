import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface EntitlementState {
  isAuthenticated: boolean;
  plan?: 'free' | 'supporter' | 'strategist';
  expiresAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class EntitlementService {
  private readonly state$ = new BehaviorSubject<EntitlementState>({
    isAuthenticated: false,
    plan: 'free',
  });

  readonly entitlement$ = this.state$.asObservable();

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = localStorage.getItem('acc_entitlement');
    if (raw) {
      const parsed = JSON.parse(raw) as EntitlementState;
      if (parsed.expiresAt) {
        parsed.expiresAt = new Date(parsed.expiresAt);
      }
      this.state$.next(parsed);
    }
  }

  loginWithStripe(sessionId: string): void {
    this.state$.next({
      isAuthenticated: true,
      plan: 'supporter',
      expiresAt: this.getExpiry(30),
    });
    this.persist();
    console.info('Stripe session activated', sessionId);
  }

  loginWithMemberful(memberId: string): void {
    this.state$.next({
      isAuthenticated: true,
      plan: 'strategist',
      expiresAt: this.getExpiry(90),
    });
    this.persist();
    console.info('Memberful entitlement loaded', memberId);
  }

  logout(): void {
    this.state$.next({ isAuthenticated: false, plan: 'free' });
    this.persist();
  }

  private getExpiry(days: number): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }

  private persist(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const state = this.state$.value;
    localStorage.setItem('acc_entitlement', JSON.stringify(state));
  }
}
