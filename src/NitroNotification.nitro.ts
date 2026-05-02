import type { HybridObject } from 'react-native-nitro-modules';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationPayload {
  title: string | undefined;
  body: string | undefined;
  data: Record<string, string> | undefined;
  badge: number | undefined;
}

export interface NotificationResponse {
  notification: NotificationPayload;
  actionIdentifier: string;
}

export interface ForegroundPresentationOptions {
  alert: boolean;
  badge: boolean;
  sound: boolean;
}

export interface NitroNotification extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  requestPermissions(): Promise<PermissionStatus>;
  getPermissionStatus(): Promise<PermissionStatus>;
  getDevicePushToken(): Promise<string>;
  unregisterForNotifications(): Promise<void>;
  setOnTokenRefreshed(callback: (token: string) => void): void;
  setOnNotificationReceived(
    callback: (notification: NotificationPayload) => void
  ): void;
  setOnNotificationTapped(
    callback: (response: NotificationResponse) => void
  ): void;
  setForegroundPresentationOptions(
    options: ForegroundPresentationOptions
  ): void;
}
