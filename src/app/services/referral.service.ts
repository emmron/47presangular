import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReferralService {
  private readonly storageKey = 'acc_referral_code';

  getReferralCode(): string {
    if (typeof window === 'undefined') {
      return 'ACC-OFFLINE';
    }

    const existing = localStorage.getItem(this.storageKey);
    if (existing) {
      return existing;
    }

    const generated = `ACC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    localStorage.setItem(this.storageKey, generated);
    return generated;
  }

  setReferralCode(code: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(this.storageKey, code.toUpperCase());
  }
}
