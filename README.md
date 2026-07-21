# react-native-nitro-notification

A high-performance React Native remote push notification library built on [NitroModules](https://nitro.margelo.com).

> **Platform support:** iOS only. Android support is not yet implemented.

## Installation

```sh
yarn add react-native-nitro-notification
npx pod-install
```

## iOS setup

The library needs to receive the APNs device token from your app delegate. Add the following to your `AppDelegate`:

```swift
import NitroNotification

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
```

No other app delegate changes are required. The library registers itself as a `UNUserNotificationCenterDelegate` automatically at load time.

## Usage

### Request permissions

```ts
import { Notifications } from 'react-native-nitro-notification'

const status = await Notifications.requestPermissions({
  alert: true,
  sound: true,
  badge: true,
})
// status: 'granted' | 'denied' | 'undetermined' | 'provisional'
```

### Get current permission status

```ts
const status = await Notifications.getPermissionStatus()
```

### Get the APNs push token

`requestPermissions` automatically registers for remote notifications on success, so the token is available immediately after a `'granted'` or `'provisional'` result.

```ts
const token = await Notifications.getDevicePushToken()
```

### Unregister from remote notifications

```ts
await Notifications.unregisterForNotifications()
```

### Listen for events

```ts
// Token refreshed
const sub = Notifications.addOnTokenRefreshed((token) => {
  console.log('New token:', token)
})

// Notification tapped
const sub = Notifications.addOnNotificationTapped((response) => {
  console.log('Tapped:', response.notification.title)
  console.log('Action:', response.actionIdentifier)
})

// Clean up
sub.remove()
```

### Handle foreground notifications

By default, foreground notifications are presented with alert, badge, and sound. Use `setNotificationHandler` to control presentation per notification:

```ts
Notifications.setNotificationHandler(async (notification) => {
  console.log('Received in foreground:', notification.title)
  return { alert: true, badge: true, sound: false }
})

// Clear the handler
Notifications.setNotificationHandler(undefined)
```

The handler has a default timeout of 5000 ms. If it rejects or times out, the notification falls back to showing alert, badge, and sound.

```ts
// Custom timeout
Notifications.setNotificationHandler(async (notification) => {
  return { alert: true, badge: false, sound: true }
}, 3000)
```

## API

### `Notifications`

| Method | Description |
|---|---|
| `requestPermissions(options?)` | Prompts the user for notification permissions. Returns the resulting `PermissionStatus`. On success, also calls `registerForRemoteNotifications()` so the push token is immediately available. |
| `getPermissionStatus()` | Returns the current `PermissionStatus` without prompting. |
| `getDevicePushToken()` | Registers for remote notifications and resolves with the APNs device token as a hex string. |
| `unregisterForNotifications()` | Unregisters from remote notifications on the device. |
| `setNotificationHandler(handler, timeoutMs?)` | Sets a callback invoked when a notification arrives while the app is in the foreground. The handler returns `NotificationPresentationOptions` to control how the notification is shown. Pass `undefined` to clear the handler. |
| `addOnTokenRefreshed(listener)` | Subscribes to push token refresh events. Returns a `ListenerSubscription`. |
| `addOnNotificationTapped(listener)` | Subscribes to notification tap events. Returns a `ListenerSubscription`. |

### `PermissionStatus`

| Value | Description |
|---|---|
| `'granted'` | The user has authorized notifications. |
| `'denied'` | The user has denied notifications. |
| `'undetermined'` | The user has not yet been asked. |
| `'provisional'` | Provisional authorization (iOS) -- notifications deliver silently to Notification Center without a prompt. |

### `RequestPermissionsOptions`

All fields are iOS-specific. On Android, this object is accepted but ignored.

| Property | Type | Default | Description |
|---|---|---|---|
| `alert` | `boolean?` | `true` | Show notification banners and Notification Center entries. |
| `sound` | `boolean?` | `true` | Play a sound when a notification is delivered. |
| `badge` | `boolean?` | `true` | Update the app icon badge number. |
| `carPlay` | `boolean?` | `false` | Display notifications in CarPlay. |
| `criticalAlert` | `boolean?` | `false` | Play sound even when muted or Do Not Disturb is on. Requires an Apple entitlement. |
| `providesAppNotificationSettings` | `boolean?` | `false` | Show a link to your in-app notification settings from the system settings page. |
| `provisional` | `boolean?` | `false` | Request provisional authorization -- no prompt shown to the user. |

### `NotificationPayload`

| Property | Type | Description |
|---|---|---|
| `title` | `string?` | Notification title. |
| `body` | `string?` | Notification body. |
| `data` | `Record<string, string>?` | Custom key-value payload. |
| `badge` | `number?` | Badge count included in the payload. |

### `NotificationResponse`

Received in `addOnNotificationTapped` callbacks.

| Property | Type | Description |
|---|---|---|
| `notification` | `NotificationPayload` | The notification that was tapped. |
| `actionIdentifier` | `string` | The identifier of the action that was invoked (e.g. `UNNotificationDefaultActionIdentifier` for a plain tap). |

### `NotificationPresentationOptions`

Returned by the `NotificationHandler` to control foreground presentation.

| Property | Type | Description |
|---|---|---|
| `alert` | `boolean` | Show the notification banner. |
| `badge` | `boolean` | Update the app icon badge. |
| `sound` | `boolean` | Play the notification sound. |

### `NotificationHandler`

```ts
type NotificationHandler = (
  notification: NotificationPayload
) => Promise<NotificationPresentationOptions>
```

### `ListenerSubscription`

```ts
interface ListenerSubscription {
  remove: () => void
}
```

## License

MIT
