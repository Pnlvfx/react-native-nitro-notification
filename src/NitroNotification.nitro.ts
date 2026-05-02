import type { HybridObject } from 'react-native-nitro-modules';

export type PermissionStatus =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'provisional';

export interface RequestPermissionsOptions {
  /** Show notification banners and Notification Center entries. @default true */
  alert?: boolean;
  /** Play a sound when a notification is delivered. @default true */
  sound?: boolean;
  /** Update the app icon badge number. @default true */
  badge?: boolean;
  /** Display notifications in CarPlay. @default false */
  carPlay?: boolean;
  /** Play sound even when muted or Do Not Disturb is on. Requires an Apple entitlement. @default false */
  criticalAlert?: boolean;
  /** Tells the system to show a link to your in-app notification settings from the system settings page. @default false */
  providesAppNotificationSettings?: boolean;
  /** Request provisional authorization — notifications deliver silently to Notification Center with no prompt shown to the user. @default false */
  provisional?: boolean;
}

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
  requestPermissions(
    options?: RequestPermissionsOptions
  ): Promise<PermissionStatus>;
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
