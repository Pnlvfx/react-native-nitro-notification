import Foundation

/// The key used in the NSNotification userInfo dict for the raw APNs device token Data.
/// Post `NitroNotificationTokenNotification` with `[NitroNotificationTokenKey: Data]` from your AppDelegate.
public let NitroNotificationTokenKey = "NitroNotificationDeviceToken"
public let NitroNotificationTokenNotification = Notification.Name("NitroNotificationDidRegisterToken")

/// Called from NitroNotificationLoader.mm via @_cdecl so the ObjC +load
/// method can bootstrap NotificationHub without importing the C++ umbrella.
@_cdecl("NitroNotification_setup")
public func nitroNotificationSetup() {
  _ = NotificationHub.shared
}
