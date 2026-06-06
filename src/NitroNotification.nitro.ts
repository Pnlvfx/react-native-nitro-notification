import type { HybridObject } from 'react-native-nitro-modules';
import type { PermissionStatus } from './types/PermissionStatus';
import type { RequestPermissionsOptions } from './types/RequestPermissionsOptions';
import type { NotificationPayload } from './types/NotificationPayload';
import type { NotificationResponse } from './types/NotificationResponse';
import type { ForegroundPresentationOptions } from './types/ForegroundPresentationOptions';

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
  setOnTokenRefreshed(callback: ((token: string) => void) | undefined): void;
  setOnNotificationReceived(
    callback: ((notification: NotificationPayload) => void) | undefined
  ): void;
  setOnNotificationTapped(
    callback: ((response: NotificationResponse) => void) | undefined
  ): void;
  setForegroundPresentationOptions(
    options: ForegroundPresentationOptions
  ): void;
}
