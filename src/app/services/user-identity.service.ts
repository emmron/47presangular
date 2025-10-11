import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'tracker-user-id';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService {
  private userIdSubject = new BehaviorSubject<string | null>(this.loadUserId());
  readonly userId$ = this.userIdSubject.asObservable();

  getUserId(): string | null {
    return this.userIdSubject.getValue();
  }

  ensureUserId(): string {
    const existing = this.getUserId();
    if (existing) {
      return existing;
    }

    const newId = this.generateId();
    this.persist(newId);
    this.userIdSubject.next(newId);
    return newId;
  }

  clearUserId(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.userIdSubject.next(null);
  }

  private loadUserId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private persist(id: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Swallow persistence errors silently to avoid breaking UX in private mode
    }
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'user-' + Math.random().toString(36).slice(2, 11);
  }
}
