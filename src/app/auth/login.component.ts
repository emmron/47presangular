import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { SocialProvider } from './auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  displayName = '';
  socialError: string | null = null;
  error: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  signInWithEmail(): void {
    if (!this.email) {
      this.error = 'Please provide an email address to continue.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.loginWithEmail(this.email, this.displayName).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/news']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.message || 'Unable to sign in with email.';
      }
    });
  }

  signInWith(provider: SocialProvider): void {
    this.loading = true;
    this.socialError = null;

    this.authService.loginWithSocial(provider, {
      externalToken: this.generateSocialNonce(),
      email: this.email || undefined,
      displayName: this.displayName || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/news']);
      },
      error: (err) => {
        this.loading = false;
        this.socialError = err.message || 'Social sign in failed.';
      }
    });
  }

  private generateSocialNonce(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
