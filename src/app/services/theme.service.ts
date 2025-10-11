import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

type ThemePreference = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app-theme';
  private readonly themeSubject = new BehaviorSubject<ThemePreference>('light');

  readonly theme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly storage: LocalStorageService
  ) {
    const storedPreference = this.storage.getItem<ThemePreference>(this.storageKey);

    if (storedPreference) {
      this.themeSubject.next(storedPreference);
    } else if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.themeSubject.next(prefersDark ? 'dark' : 'light');
    }

    this.applyTheme(this.themeSubject.value);

    this.themeSubject.subscribe(theme => {
      this.applyTheme(theme);
      this.storage.setItem(this.storageKey, theme);
    });
  }

  toggleTheme(): void {
    const nextTheme: ThemePreference = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.themeSubject.next(nextTheme);
  }

  setTheme(theme: ThemePreference): void {
    this.themeSubject.next(theme);
  }

  get currentTheme(): ThemePreference {
    return this.themeSubject.value;
  }

  private applyTheme(theme: ThemePreference): void {
    const root = this.document.documentElement;
    root.setAttribute('data-theme', theme);
  }
}
