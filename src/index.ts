import type { NitroNotification } from './NitroNotification.nitro';
import { NitroModules } from 'react-native-nitro-modules';
import { createNotificationListeners } from './NotificationListeners';

export type { PermissionStatus } from './types/PermissionStatus';
export type { RequestPermissionsOptions } from './types/RequestPermissionsOptions';
export type { NotificationPayload } from './types/NotificationPayload';
export type { NotificationResponse } from './types/NotificationResponse';
export type { ForegroundPresentationOptions } from './types/ForegroundPresentationOptions';
export type { ListenerSubscription } from './types/ListenerSubscription';

const native =
  NitroModules.createHybridObject<NitroNotification>('NitroNotification');
const listeners = createNotificationListeners(native);

export const Notifications = {
  requestPermissions: native.requestPermissions.bind(native),
  getPermissionStatus: native.getPermissionStatus.bind(native),
  getDevicePushToken: native.getDevicePushToken.bind(native),
  unregisterForNotifications: native.unregisterForNotifications.bind(native),
  setForegroundPresentationOptions:
    native.setForegroundPresentationOptions.bind(native),
  addOnTokenRefreshed: listeners.addOnTokenRefreshed,
  addOnNotificationReceived: listeners.addOnNotificationReceived,
  addOnNotificationTapped: listeners.addOnNotificationTapped,
};
