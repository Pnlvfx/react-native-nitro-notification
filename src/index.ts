import type { NitroNotification } from './NitroNotification.nitro';
import { NitroModules } from 'react-native-nitro-modules';

export type {
  PermissionStatus,
  NotificationPayload,
  NotificationResponse,
  ForegroundPresentationOptions,
} from './NitroNotification.nitro';

export const Notifications =
  NitroModules.createHybridObject<NitroNotification>('NitroNotification');
