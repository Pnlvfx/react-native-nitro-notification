import Foundation
import UIKit
import UserNotifications
import NitroModules

final class HybridNitroNotification: HybridNitroNotificationSpec {

  // MARK: - Permissions

  func requestPermissions(options: RequestPermissionsOptions?) throws -> Promise<PermissionStatus> {
    return Promise.async {
      let center = UNUserNotificationCenter.current()
      var authOptions: UNAuthorizationOptions = []
      if options?.alert != false { authOptions.insert(.alert) }
      if options?.sound != false { authOptions.insert(.sound) }
      if options?.badge != false { authOptions.insert(.badge) }
      if options?.carPlay == true { authOptions.insert(.carPlay) }
      if options?.criticalAlert == true { authOptions.insert(.criticalAlert) }
      if options?.providesAppNotificationSettings == true { authOptions.insert(.providesAppNotificationSettings) }
      if options?.provisional == true { authOptions.insert(.provisional) }
      let granted = try await center.requestAuthorization(options: authOptions)
      if granted {
        await MainActor.run {
          UIApplication.shared.registerForRemoteNotifications()
        }
        if options?.provisional == true {
          return PermissionStatus.provisional
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
      case .authorized, .ephemeral:
        return PermissionStatus.granted
      case .provisional:
        return PermissionStatus.provisional
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
      await MainActor.run {
        UIApplication.shared.registerForRemoteNotifications()
      }
      return await NotificationHub.shared.awaitToken()
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

  func setOnTokenRefreshed(callback: ((String) -> Void)?) throws {
    NotificationHub.shared.setOnTokenRefreshed(callback)
  }

  func setOnNotificationTapped(callback: ((NotificationResponse) -> Void)?) throws {
    NotificationHub.shared.setOnNotificationTapped(callback)
  }

  // MARK: - Badge

  func getBadgeCount() throws -> Promise<Double> {
    return Promise.async {
      return await MainActor.run {
        Double(UIApplication.shared.applicationIconBadgeNumber)
      }
    }
  }

  func setBadgeCount(count: Double) throws -> Promise<Bool> {
    return Promise.async {
      let center = UNUserNotificationCenter.current()
      let settings = await center.notificationSettings()
      guard settings.badgeSetting == .enabled else {
        return false
      }
      let intCount = Int(count)
      if #available(iOS 16.0, *) {
        try await center.setBadgeCount(intCount)
      } else {
        await MainActor.run {
          UIApplication.shared.applicationIconBadgeNumber = intCount
        }
      }
      return true
    }
  }

  // MARK: - Foreground Presentation

  func setNotificationHandler(
    handler: ((NotificationPayload) -> Promise<Promise<NotificationPresentationOptions>>)?,
    handlerTimeoutMs: Double?
  ) throws {
    NotificationHub.shared.setNotificationHandler(handler, handlerTimeoutMs: handlerTimeoutMs)
  }

}
