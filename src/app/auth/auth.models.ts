export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type SocialProvider = 'google' | 'twitter' | 'facebook';
