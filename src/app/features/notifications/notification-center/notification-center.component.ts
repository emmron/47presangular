import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserPreferencesService } from '../../../services/user-preferences.service';
import { NotificationDeliveryService } from '../../../services/notification-delivery.service';
import { UserNotification } from '../../../models/user.model';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent {
  readonly notifications$ = this.preferences.notifications$;
  permission: NotificationPermission | 'unsupported' = typeof Notification === 'undefined'
    ? 'unsupported'
    : Notification.permission;
  loadingPermission = false;

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly delivery: NotificationDeliveryService
  ) {}

  get unreadCount(): number {
    return this.preferences.notificationsSnapshot.filter(notification => !notification.readAt).length;
  }

  async requestBrowserPermission(): Promise<void> {
    this.loadingPermission = true;
    try {
      this.permission = await this.delivery.requestBrowserPermission();
    } finally {
      this.loadingPermission = false;
    }
  }

  async markAsRead(notification: UserNotification): Promise<void> {
    if (notification.readAt) {
      return;
    }
    await this.preferences.markNotificationAsRead(notification.id);
  }

  async markAllAsRead(): Promise<void> {
    await this.preferences.markAllNotificationsAsRead();
  }

  trackById(_index: number, notification: UserNotification): string {
    return notification.id;
  }
}
