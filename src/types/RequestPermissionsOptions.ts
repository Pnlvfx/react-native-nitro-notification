/**
 * Options for requesting notification permissions.
 *
 * @platform ios
 * All fields in this interface are iOS/APNs specific.
 * On Android, this interface is accepted but all fields are ignored —
 * Android uses a single runtime permission (POST_NOTIFICATIONS on API 33+)
 * with no granular capability selection.
 */
export interface RequestPermissionsOptions {
  /** Show notification banners and Notification Center entries. @default true */
  alert?: boolean;
  /** Play a sound when a notification is delivered. @default true */
  sound?: boolean;
  /** Update the app icon badge number. @default true */
  badge?: boolean;
  /** Display notifications in CarPlay. iOS only. @default false */
  carPlay?: boolean;
  /** Play sound even when muted or Do Not Disturb is on. Requires an Apple entitlement. iOS only. @default false */
  criticalAlert?: boolean;
  /** Tells the system to show a link to your in-app notification settings from the system settings page. iOS only. @default false */
  providesAppNotificationSettings?: boolean;
  /** Request provisional authorization — notifications deliver silently to Notification Center with no prompt shown to the user. iOS only. @default false */
  provisional?: boolean;
}
