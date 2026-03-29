import { NitroModules } from 'react-native-nitro-modules';
import type { NitroNotification } from './NitroNotification.nitro';

const NitroNotificationHybridObject =
  NitroModules.createHybridObject<NitroNotification>('NitroNotification');

export function multiply(a: number, b: number): number {
  return NitroNotificationHybridObject.multiply(a, b);
}
