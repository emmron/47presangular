import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly isBrowser = typeof window !== 'undefined';

  getItem<T = string>(key: string): T | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      const value = window.localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      console.warn('LocalStorageService: Unable to read key', key, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('LocalStorageService: Unable to persist key', key, error);
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn('LocalStorageService: Unable to remove key', key, error);
    }
  }
}
