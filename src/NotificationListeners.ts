import type { ListenerSubscription } from './types/ListenerSubscription';
import type { NotificationPayload } from './types/NotificationPayload';
import type { NotificationResponse } from './types/NotificationResponse';
import type { NitroNotification } from './NitroNotification.nitro';

type Listener<TEvent> = (event: TEvent) => void;
type NativeRegister<TEvent> = (listener: Listener<TEvent> | undefined) => void;

/**
 * Creates a multi-subscriber event channel that bridges to a single native slot.
 *
 * Internally, one aggregator listener is registered on the native side when the
 * first subscriber joins and unregistered when the last one leaves. Each caller
 * gets an independent ListenerSubscription with a remove() handle that only
 * affects their own subscription.
 */
const createEventChannel = <TEvent>(
  registerOnNative: NativeRegister<TEvent>
): ((listener: Listener<TEvent>) => ListenerSubscription) => {
  const subscribers = new Set<Listener<TEvent>>();

  const aggregator = (event: TEvent): void => {
    subscribers.forEach((listener) => listener(event));
  };

  return (listener: Listener<TEvent>): ListenerSubscription => {
    if (subscribers.size === 0) {
      registerOnNative(aggregator);
    }
    subscribers.add(listener);
    return {
      remove: () => {
        subscribers.delete(listener);
        if (subscribers.size === 0) {
          registerOnNative(undefined);
        }
      },
    };
  };
};

export const createNotificationListeners = (native: NitroNotification) => ({
  addOnTokenRefreshed: createEventChannel<string>((listener) =>
    native.setOnTokenRefreshed(listener)
  ),
  addOnNotificationReceived: createEventChannel<NotificationPayload>(
    (listener) => native.setOnNotificationReceived(listener)
  ),
  addOnNotificationTapped: createEventChannel<NotificationResponse>(
    (listener) => native.setOnNotificationTapped(listener)
  ),
});
