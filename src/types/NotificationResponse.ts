import type { NotificationPayload } from './NotificationPayload';

export interface NotificationResponse {
  notification: NotificationPayload;
  actionIdentifier: string;
}
