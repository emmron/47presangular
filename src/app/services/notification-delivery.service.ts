import { Injectable } from '@angular/core';

import { SupabaseClientService } from './supabase-client.service';
import { AuthService } from './auth.service';
import { DigestFrequency, IngestionNotificationPayload, NotificationPreferences } from '../models/user.model';
import { UserPreferencesService } from './user-preferences.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationDeliveryService {
  constructor(
    private readonly supabase: SupabaseClientService,
    private readonly auth: AuthService,
    private readonly preferences: UserPreferencesService
  ) {}

  get hasBrowserNotificationPermission(): boolean {
    if (typeof Notification === 'undefined') {
      return false;
    }
    return Notification.permission === 'granted';
  }

  async requestBrowserPermission(): Promise<NotificationPermission> {
    if (typeof Notification === 'undefined') {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return Notification.permission;
    }

    return Notification.requestPermission();
  }

  async registerPushSubscription(subscription: PushSubscription | PushSubscriptionJSON): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to enable push notifications');
    }

    if (!this.supabase.isConfigured) {
      console.info('Push subscription captured locally', subscription); // eslint-disable-line no-console
      return;
    }

    const client = this.supabase.getClient();
    const { error } = await client.from('push_subscriptions').upsert({
      user_id: user.id,
      subscription: 'toJSON' in subscription ? subscription.toJSON() : subscription,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to register push subscription', error);
    }
  }

  async optInToEmailDigest(frequency: DigestFrequency): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to manage digests');
    }

    const currentPreferences = this.preferences.currentProfile?.notificationPreferences ?? {
      emailDigest: false,
      pushNotifications: false,
      digestFrequency: 'weekly'
    };

    const updatedPreferences: NotificationPreferences = {
      ...currentPreferences,
      emailDigest: true,
      digestFrequency: frequency
    };

    await this.preferences.updateNotificationPreferences(updatedPreferences);

    if (!this.supabase.isConfigured) {
      console.info('Email digest preference saved locally for', user.id); // eslint-disable-line no-console
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('email-digest-opt-in', {
      body: {
        userId: user.id,
        frequency
      }
    });

    if (error) {
      console.error('Failed to opt-in to email digest', error);
    }
  }

  async optOutOfEmailDigest(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }

    const currentPreferences = this.preferences.currentProfile?.notificationPreferences;
    if (currentPreferences) {
      await this.preferences.updateNotificationPreferences({
        ...currentPreferences,
        emailDigest: false
      });
    }

    if (!this.supabase.isConfigured) {
      console.info('Email digest opt-out saved locally for', user.id); // eslint-disable-line no-console
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('email-digest-opt-out', {
      body: {
        userId: user.id
      }
    });

    if (error) {
      console.error('Failed to opt-out of email digest', error);
    }
  }

  async enablePushNotifications(subscription: PushSubscription | PushSubscriptionJSON, topics: string[]): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to enable notifications');
    }

    await this.registerPushSubscription(subscription);

    const currentPreferences = this.preferences.currentProfile?.notificationPreferences ?? {
      emailDigest: false,
      pushNotifications: false,
      digestFrequency: 'weekly'
    };

    await this.preferences.updateNotificationPreferences({
      ...currentPreferences,
      pushNotifications: true
    });

    if (!this.supabase.isConfigured) {
      console.info('Push notification opt-in saved locally for', user.id); // eslint-disable-line no-console
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('push-notification-opt-in', {
      body: {
        userId: user.id,
        topics,
        subscription
      }
    });

    if (error) {
      console.error('Failed to opt-in to push notifications', error);
    }
  }

  async disablePushNotifications(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      return;
    }

    const currentPreferences = this.preferences.currentProfile?.notificationPreferences;
    if (currentPreferences) {
      await this.preferences.updateNotificationPreferences({
        ...currentPreferences,
        pushNotifications: false
      });
    }

    if (!this.supabase.isConfigured) {
      console.info('Push opt-out saved locally for', user.id); // eslint-disable-line no-console
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('push-notification-opt-out', {
      body: {
        userId: user.id
      }
    });

    if (error) {
      console.error('Failed to opt-out of push notifications', error);
    }
  }

  async dispatchIngestionDigest(payload: IngestionNotificationPayload): Promise<void> {
    if (!this.supabase.isConfigured) {
      console.info('Dispatching ingestion digest locally', payload.topic); // eslint-disable-line no-console
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('dispatch-ingestion-digest', {
      body: payload
    });

    if (error) {
      console.error('Failed to trigger ingestion digest', error);
    }
  }

  async sendTestNotification(title: string, body: string, link?: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User must be signed in to send a test notification');
    }

    if (!this.supabase.isConfigured) {
      this.showBrowserNotification(title, body, link);
      return;
    }

    const { error } = await this.supabase.getClient().functions.invoke('send-test-notification', {
      body: {
        userId: user.id,
        title,
        body,
        link
      }
    });

    if (error) {
      console.error('Failed to send test notification', error);
    }
  }

  private showBrowserNotification(title: string, body: string, link?: string): void {
    if (typeof Notification === 'undefined') {
      return;
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: '/assets/icons/icon-192x192.png'
    });

    if (link) {
      notification.onclick = () => {
        window.open(link, '_blank');
      };
    }
  }
}
