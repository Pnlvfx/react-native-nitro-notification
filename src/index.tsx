import { NitroModules } from 'react-native-nitro-modules';
import type { NitroNotification } from './NitroNotification.nitro';

export type {
  PermissionStatus,
  NotificationPayload,
  NotificationResponse,
} from './NitroNotification.nitro';

export const Notifications =
  NitroModules.createHybridObject<NitroNotification>('NitroNotification');
