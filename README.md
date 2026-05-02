# react-native-nitro-notification

> **Work in progress.** This library is under active development, the API will likely change, and it is not ready for production use.

A thin, fast, type-safe wrapper around **Apple Push Notification service (APNs)** for React Native, built on [Nitro Modules](https://nitro.margelo.com/).

This library is for **remote push notifications only** — notifications sent from a server to a device via APNs. It is not for local (in-app scheduled) notifications. It handles:

- Requesting and checking notification permissions
- Registering with APNs to get a device token you send to your server
- Receiving notifications while the app is in the foreground
- Handling notification taps (foreground and background)
- Controlling how notifications appear when the app is open

Your backend is responsible for sending the actual push via APNs or a provider like [Firebase FCM](https://firebase.google.com/docs/cloud-messaging), [OneSignal](https://onesignal.com/), or [Expo Push](https://docs.expo.dev/push-notifications/overview/).

> iOS only for now. Android support is not yet planned.

## Requirements

- React Native 0.76+
- New Architecture enabled
- `react-native-nitro-modules` installed

## Installation

```sh
yarn add react-native-nitro-notification react-native-nitro-modules
```

Then install pods:

```sh
cd ios && pod install
```

---

## iOS Setup

The library needs to receive the device push token from the system. iOS delivers this exclusively through two `AppDelegate` methods that you must forward manually.

Open your `AppDelegate.swift` and add the following:

```swift
// Inside your AppDelegate class:

func application(
  _ application: UIApplication,
  didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
) {
  NotificationCenter.default.post(
    name: NitroNotificationTokenNotification,
    object: nil,
    userInfo: [NitroNotificationTokenKey: deviceToken]
  )
}

func application(
  _ application: UIApplication,
  didFailToRegisterForRemoteNotificationsWithError error: Error
) {
  // handle or ignore
}
```

These two methods are the **only** way iOS delivers push tokens to an app. There is no alternative hook. The library re-exports `NitroNotificationTokenNotification` and `NitroNotificationTokenKey` so you don't have to hardcode any strings.

---

## Capabilities

In Xcode, go to your target > **Signing & Capabilities** and add **Push Notifications**.

**Background Modes** (optional) — only needed if you want your app to wake up in the background to silently process a notification before the user taps it (requires `content-available: 1` in the APNs payload). Not needed for standard foreground/tap notification handling.

---

## Usage

```ts
import { Notifications } from 'react-native-nitro-notification';
```

### Request permissions

Must be called before any notification can be delivered. Prompts the user on first call. Returns a `PermissionStatus` indicating the outcome.

```ts
// Default — requests alert, sound and badge. Shows the system prompt.
const status = await Notifications.requestPermissions();

// Custom options
const status = await Notifications.requestPermissions({
  alert: true,  // default: true
  sound: true,  // default: true
  badge: true,  // default: true
  provisional: true, // silent delivery, no prompt shown — see Provisional notifications below
});
```

> **`criticalAlert`** plays sound even in silent mode / Do Not Disturb. It requires a special Apple entitlement — you must [request it from Apple](https://developer.apple.com/contact/request/notifications-critical-alerts-entitlement/) before using it.

### Get current permission status

Checks the current authorization state without prompting the user.

```ts
const status = await Notifications.getPermissionStatus();
// 'granted' | 'denied' | 'undetermined' | 'provisional'
```

### Provisional notifications

Provisional authorization lets you deliver notifications silently — no system prompt is shown to the user upfront. Notifications arrive quietly in Notification Center only (no banner, no sound). The user can then promote your app to full authorization or turn it off directly from there.

This is useful when you want to demonstrate value before asking for full permissions.

```ts
// Step 1 — request provisional auth. No dialog shown, resolves immediately.
const status = await Notifications.requestPermissions({ provisional: true });
// status === 'provisional'

// ... deliver a few silent notifications to show value ...

// Step 2 — at the right moment, request full permissions. Shows the system dialog.
const upgraded = await Notifications.requestPermissions();
// 'granted' | 'denied'
```

See [Apple's documentation](https://developer.apple.com/documentation/usernotifications/asking-permission-to-use-notifications) for the full authorization model.

### Get the device push token

Returns the APNs device token as a hex string. Resolves once the token is available — call `requestPermissions()` first so the system registers the device.

```ts
const token = await Notifications.getDevicePushToken();
// e.g. 'a1b2c3d4e5f6...'
```

### Listen for token refreshes

APNs tokens can change. Register a listener to always have the latest one.

```ts
Notifications.setOnTokenRefreshed((token) => {
  // send token to your server
});
```

### Unregister from notifications

Stops receiving remote notifications and invalidates the push token.

```ts
await Notifications.unregisterForNotifications();
```

### Handle foreground notifications

Fired when a notification arrives while the app is in the foreground.

```ts
Notifications.setOnNotificationReceived((notification) => {
  console.log(notification.title);
  console.log(notification.body);
  console.log(notification.data); // Record<string, string> | undefined
  console.log(notification.badge); // number | undefined
});
```

### Handle notification taps

Fired when the user taps a notification (foreground or background).

```ts
Notifications.setOnNotificationTapped((response) => {
  console.log(response.actionIdentifier); // e.g. 'com.apple.UNNotificationDefaultActionIdentifier'
  console.log(response.notification.title);
});
```

### Control foreground presentation

By default all three options are enabled. Call this to customize how notifications appear when the app is in the foreground.

```ts
Notifications.setForegroundPresentationOptions({
  alert: true, // banner
  badge: true,
  sound: true,
});
```

---

## Types

```ts
type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'provisional';

interface RequestPermissionsOptions {
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
  /** Show a link to your in-app notification settings from the system settings page. @default false */
  providesAppNotificationSettings?: boolean;
  /** Request provisional authorization — silent delivery, no prompt shown. @default false */
  provisional?: boolean;
}

interface NotificationPayload {
  title: string | undefined;
  body: string | undefined;
  data: Record<string, string> | undefined;
  badge: number | undefined;
}

interface NotificationResponse {
  notification: NotificationPayload;
  actionIdentifier: string;
}

interface ForegroundPresentationOptions {
  alert: boolean;
  badge: boolean;
  sound: boolean;
}
```

---

## Full example

```ts
import { useEffect } from 'react';
import { Notifications } from 'react-native-nitro-notification';

const setupNotifications = async () => {
  const status = await Notifications.requestPermissions();
  if (status === 'denied' || status === 'undetermined') return;
  // status is 'granted' or 'provisional' — either way we can get a token

  const token = await Notifications.getDevicePushToken();
  await sendTokenToServer(token);

  Notifications.setOnTokenRefreshed(async (newToken) => {
    await sendTokenToServer(newToken);
  });

  Notifications.setForegroundPresentationOptions({
    alert: true,
    badge: false,
    sound: true,
  });

  Notifications.setOnNotificationReceived((notification) => {
    console.log('Received:', notification.title);
  });

  Notifications.setOnNotificationTapped((response) => {
    console.log('Tapped:', response.notification.title);
  });
};

useEffect(() => {
  setupNotifications();
}, []);
```

---

## License

MIT
