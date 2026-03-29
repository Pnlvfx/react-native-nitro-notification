import Foundation
import UIKit
import UserNotifications

final class NotificationHub: NSObject, UNUserNotificationCenterDelegate {
  static let shared = NotificationHub()

  var foregroundAlert = true
  var foregroundBadge = true
  var foregroundSound = true

  var onTokenRefreshed: ((String) -> Void)?
  var onNotificationReceived: ((NotificationPayload) -> Void)?
  var onNotificationTapped: ((NotificationResponse) -> Void)?

  private var pendingTokenContinuations: [(String) -> Void] = []
  private var currentToken: String?

  func awaitToken(completion: @escaping (String) -> Void) {
    if let token = currentToken {
      completion(token)
      return
    }
    pendingTokenContinuations.append(completion)
  }

  func setupTokenObserver() {
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleTokenNotification(_:)),
      name: NitroNotificationTokenNotification,
      object: nil
    )
  }

  @objc private func handleTokenNotification(_ notification: Foundation.Notification) {
    guard let token = notification.userInfo?[NitroNotificationTokenKey] as? Data else { return }
    didRegisterForRemoteNotifications(deviceToken: token)
  }

  func didRegisterForRemoteNotifications(deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02x", $0) }.joined()
    currentToken = token
    onTokenRefreshed?(token)
    pendingTokenContinuations.forEach { $0(token) }
    pendingTokenContinuations.removeAll()
  }

  // MARK: - UNUserNotificationCenterDelegate

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    var options: UNNotificationPresentationOptions = []
    if foregroundAlert { options.insert(.banner) }
    if foregroundBadge { options.insert(.badge) }
    if foregroundSound { options.insert(.sound) }
    let payload = payloadFrom(notification.request.content)
    onNotificationReceived?(payload)
    completionHandler(options)
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let payload = payloadFrom(response.notification.request.content)
    let notifResponse = NotificationResponse(
      notification: payload,
      actionIdentifier: response.actionIdentifier
    )
    onNotificationTapped?(notifResponse)
    completionHandler()
  }

  // MARK: - Payload

  func payloadFrom(_ content: UNNotificationContent) -> NotificationPayload {
    var data: [String: String]? = nil
    if !content.userInfo.isEmpty {
      var dict: [String: String] = [:]
      for (key, value) in content.userInfo {
        if let k = key as? String, let v = value as? String {
          dict[k] = v
        }
      }
      data = dict.isEmpty ? nil : dict
    }
    return NotificationPayload(
      title: content.title.isEmpty ? nil : content.title,
      body: content.body.isEmpty ? nil : content.body,
      data: data,
      badge: content.badge.map { Double($0.intValue) }
    )
  }
}
