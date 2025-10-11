import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseClientService {
  private client: SupabaseClient;
  readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = !!environment.supabaseUrl && !!environment.supabaseAnonKey;

    this.client = createClient(environment.supabaseUrl || 'https://placeholder.supabase.co', environment.supabaseAnonKey || 'public-anon-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    if (!this.isConfigured) {
      console.warn('Supabase credentials are not configured. Falling back to client-side persistence.');
    }
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}
