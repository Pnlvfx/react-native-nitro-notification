# react-native-nitro-notification

A high-performance React Native notification library built on [NitroModules](https://nitro.margelo.com).

## Installation

```sh
yarn add react-native-nitro-notification
npx pod-install
```

## Usage

### Request permission

```ts
import { NitroNotification } from 'react-native-nitro-notification'

const granted = await NitroNotification.requestPermission()
```

### Schedule a notification

```ts
await NitroNotification.scheduleNotification({
  id: 1,
  title: 'Hello',
  body: 'World',
  schedule: { date: new Date(Date.now() + 5000) },
})
```

### Cancel notifications

```ts
// Cancel a specific notification
await NitroNotification.cancelNotification(1)

// Cancel all scheduled / delivered notifications
await NitroNotification.cancelAll()
```

### Listen for events

```ts
// Notification tapped
const unsubscribe = NitroNotification.onNotificationTap((notification) => {
  console.log('Tapped:', notification.id)
})

// Action button tapped (Android)
const unsubscribeAction = NitroNotification.onNotificationAction((action) => {
  console.log('Action:', action.id, 'on notification', action.notificationId)
})

// Clean up
unsubscribe()
unsubscribeAction()
```

## Android: Notification Channels

Android 8+ requires a notification channel before posting notifications.

```ts
// Create a channel
await NitroNotification.createChannel({
  id: 'general',
  name: 'General',
  description: 'General notifications',
  importance: NotificationImportance.High,
})

// List all channels
const channels = await NitroNotification.getChannels()

// Delete a channel
await NitroNotification.deleteChannel('general')
```

### Android-specific notification options

```ts
await NitroNotification.scheduleNotification({
  id: 2,
  title: 'Download complete',
  body: 'Your file is ready.',
  schedule: { date: new Date() },
  android: {
    channelId: 'general',
    importance: NotificationImportance.High,
    smallIcon: 'ic_notification',
    color: '#FF0000',
    autoCancel: true,
    ongoing: false,
    actions: [
      { id: 'open', title: 'Open' },
      { id: 'dismiss', title: 'Dismiss' },
    ],
  },
})
```

## API

### `NitroNotification`

| Method | Description |
|---|---|
| `requestPermission()` | Requests notification permission. Returns `true` if granted. |
| `scheduleNotification(request)` | Schedules a notification. |
| `cancelNotification(id)` | Cancels a notification by numeric ID. |
| `cancelAll()` | Cancels all scheduled and delivered notifications. |
| `createChannel(channel)` | Creates a notification channel (Android only). |
| `deleteChannel(channelId)` | Deletes a notification channel (Android only). |
| `getChannels()` | Returns all notification channels (Android only). |
| `onNotificationTap(callback)` | Subscribes to notification tap events. Returns an unsubscribe function. |
| `onNotificationAction(callback)` | Subscribes to action button tap events. Returns an unsubscribe function. |

### `NotificationRequest`

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Unique numeric notification ID. |
| `title` | `string` | Notification title. |
| `body` | `string` | Notification body. |
| `schedule` | `NotificationSchedule` | When to deliver the notification. |
| `android` | `AndroidNotificationOptions?` | Android-specific options. |

### `NotificationSchedule`

| Property | Type | Description |
|---|---|---|
| `date` | `Date` | The date and time to deliver the notification. |

### `AndroidNotificationOptions`

| Property | Type | Description |
|---|---|---|
| `channelId` | `string?` | Channel ID (required on Android 8+). |
| `importance` | `NotificationImportance?` | Override channel importance for this notification. |
| `smallIcon` | `string?` | Drawable resource name for the small icon. |
| `color` | `string?` | Accent color as a hex string (e.g. `'#FF0000'`). |
| `autoCancel` | `boolean?` | Dismiss notification when tapped. Defaults to `true`. |
| `ongoing` | `boolean?` | Mark notification as ongoing (cannot be dismissed by user). |
| `actions` | `ActionButton[]?` | Action buttons shown below the notification. |

### `ActionButton`

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier for the action. |
| `title` | `string` | Label displayed on the button. |
| `icon` | `string?` | Drawable resource name for the action icon. |

### `NotificationAction`

Received in `onNotificationAction` callbacks.

| Property | Type | Description |
|---|---|---|
| `id` | `string` | The action button ID that was tapped. |
| `notificationId` | `number` | The ID of the notification the action belongs to. |

### `NotificationChannel`

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique channel ID. |
| `name` | `string` | User-visible channel name. |
| `description` | `string?` | User-visible channel description. |
| `sound` | `string?` | Sound resource name. |
| `importance` | `NotificationImportance?` | Channel importance level. |

### `NotificationImportance`

| Value | Description |
|---|---|
| `NotificationImportance.Default` | Default importance. |
| `NotificationImportance.High` | High priority, makes sound and appears as heads-up. |
| `NotificationImportance.Low` | Low priority, no sound. |
| `NotificationImportance.Max` | Urgent, full-screen intent. |
| `NotificationImportance.Min` | Minimal, no sound or visual interruption. |
| `NotificationImportance.None` | No notifications. |
| `NotificationImportance.Unspecified` | Unspecified (inherits system default). |

## License

MIT
