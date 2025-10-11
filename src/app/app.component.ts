import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  email = '';
  message: string | null = null;
  loading = false;
  readonly user$ = this.auth.user$;

  constructor(private readonly auth: AuthService) {}

  async signIn(): Promise<void> {
    const email = this.email.trim();
    if (!email) {
      this.message = 'Enter an email address to continue.';
      return;
    }

    this.loading = true;
    try {
      await this.auth.signInWithOtp(email);
      this.message = this.auth.currentUser?.isGuest
        ? 'Signed in with a local session.'
        : 'Check your inbox for a magic link to finish signing in.';
      this.email = '';
    } catch (error) {
      console.error('Failed to sign in', error);
      this.message = error instanceof Error ? error.message : 'Unable to sign in. Please try again later.';
    } finally {
      this.loading = false;
    }
  }

  async signOut(): Promise<void> {
    this.loading = true;
    try {
      await this.auth.signOut();
      this.message = 'Signed out successfully.';
    } catch (error) {
      console.error('Failed to sign out', error);
      this.message = error instanceof Error ? error.message : 'Unable to sign out right now.';
    } finally {
      this.loading = false;
    }
  }
}
