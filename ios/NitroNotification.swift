import Foundation
import UIKit
import UserNotifications
import NitroModules

class NitroNotification: HybridNitroNotificationSpec {

  private var onTokenRefreshed: ((String) -> Void)?
  private var onNotificationReceived: ((NotificationPayload) -> Void)?
  private var onNotificationTapped: ((NotificationResponse) -> Void)?

  // MARK: - Permissions

  func requestPermissions() throws -> Promise<PermissionStatus> {
    return Promise.async {
      let center = UNUserNotificationCenter.current()
      center.delegate = NotificationHub.shared
      NotificationHub.shared.setupTokenObserver()
      let granted = try await center.requestAuthorization(options: [.alert, .sound, .badge])
      if granted {
        await MainActor.run {
          UIApplication.shared.registerForRemoteNotifications()
        }
        return PermissionStatus.granted
      }
      return PermissionStatus.denied
    }
  }

  func getPermissionStatus() throws -> Promise<PermissionStatus> {
    return Promise.async {
      let center = UNUserNotificationCenter.current()
      let settings = await center.notificationSettings()
      switch settings.authorizationStatus {
      case .authorized, .ephemeral, .provisional:
        return PermissionStatus.granted
      case .denied:
        return PermissionStatus.denied
      case .notDetermined:
        return PermissionStatus.undetermined
      @unknown default:
        return PermissionStatus.undetermined
      }
    }
  }

  // MARK: - Push Token

  func getDevicePushToken() throws -> Promise<String> {
    return Promise.async {
      return await withCheckedContinuation { continuation in
        NotificationHub.shared.awaitToken { token in
          continuation.resume(returning: token)
        }
      }
    }
  }

  func unregisterForNotifications() throws -> Promise<Void> {
    return Promise.async {
      await MainActor.run {
        UIApplication.shared.unregisterForRemoteNotifications()
      }
    }
  }

  // MARK: - Callbacks

  func setOnTokenRefreshed(callback: @escaping (String) -> Void) {
    onTokenRefreshed = callback
    NotificationHub.shared.onTokenRefreshed = callback
  }

  func setOnNotificationReceived(callback: @escaping (NotificationPayload) -> Void) {
    onNotificationReceived = callback
    NotificationHub.shared.onNotificationReceived = callback
  }

  func setOnNotificationTapped(callback: @escaping (NotificationResponse) -> Void) {
    onNotificationTapped = callback
    NotificationHub.shared.onNotificationTapped = callback
  }

  // MARK: - Foreground Presentation

  func setForegroundPresentationOptions(alert: Bool, badge: Bool, sound: Bool) {
    NotificationHub.shared.foregroundAlert = alert
    NotificationHub.shared.foregroundBadge = badge
    NotificationHub.shared.foregroundSound = sound
  }

}
