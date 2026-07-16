import type { NotificationPayload } from './NotificationPayload';
import type { NotificationPresentationOptions } from './NotificationPresentationOptions';

export type NotificationHandler = (
  notification: NotificationPayload
) => Promise<NotificationPresentationOptions>;
