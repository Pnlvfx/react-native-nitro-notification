import Foundation

/// The name of the NSNotification posted by the app delegate when a push token is received.
/// Post this notification with userInfo ["deviceToken": Data] from your AppDelegate.
public let NitroNotificationTokenKey = "NitroNotificationDeviceToken"
public let NitroNotificationTokenNotification = Notification.Name("NitroNotificationDidRegisterToken")
