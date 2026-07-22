import type { NitroNotification } from './NitroNotification.nitro';
import { NitroModules } from 'react-native-nitro-modules';
import { createNotificationListeners } from './NotificationListeners';

const native = NitroModules.createHybridObject<NitroNotification>('NitroNotification');

const listeners = createNotificationListeners(native);

export const Notifications = {
  requestPermissions: native.requestPermissions.bind(native),
  getPermissionStatus: native.getPermissionStatus.bind(native),
  getDevicePushToken: native.getDevicePushToken.bind(native),
  unregisterForNotifications: native.unregisterForNotifications.bind(native),
  setNotificationHandler: native.setNotificationHandler.bind(native),
  addOnTokenRefreshed: listeners.addOnTokenRefreshed,
  addOnNotificationTapped: listeners.addOnNotificationTapped,
  getBadgeCount: native.getBadgeCount.bind(native),
  setBadgeCount: native.setBadgeCount.bind(native),
};

export type { PermissionStatus } from './types/PermissionStatus';
export type { RequestPermissionsOptions } from './types/RequestPermissionsOptions';
export type { NotificationPayload } from './types/NotificationPayload';
export type { NotificationResponse } from './types/NotificationResponse';
export type { NotificationPresentationOptions } from './types/NotificationPresentationOptions';
export type { NotificationHandler } from './types/NotificationHandler';
export type { ListenerSubscription } from './types/ListenerSubscription';
