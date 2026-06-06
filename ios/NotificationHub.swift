import Foundation
import UserNotifications

final class NotificationHub: NSObject, UNUserNotificationCenterDelegate {
  static let shared = NotificationHub()

  private let lock = NSLock()

  private var _foregroundAlert = true
  private var _foregroundBadge = true
  private var _foregroundSound = true

  private var _onTokenRefreshed: ((String) -> Void)?
  private var _onNotificationReceived: ((NotificationPayload) -> Void)?
  private var _onNotificationTapped: ((NotificationResponse) -> Void)?

  private var _pendingTokenContinuations: [(String) -> Void] = []
  private var _currentToken: String?

  override private init() {
    super.init()
    UNUserNotificationCenter.current().delegate = self
    setupTokenObserver()
  }

  // MARK: - Thread-safe setters

  func setOnTokenRefreshed(_ callback: ((String) -> Void)?) {
    lock.withLock { _onTokenRefreshed = callback }
  }

  func setOnNotificationReceived(_ callback: ((NotificationPayload) -> Void)?) {
    lock.withLock { _onNotificationReceived = callback }
  }

  func setOnNotificationTapped(_ callback: ((NotificationResponse) -> Void)?) {
    lock.withLock { _onNotificationTapped = callback }
  }

  func setForegroundPresentationOptions(_ options: ForegroundPresentationOptions) {
    lock.withLock {
      _foregroundAlert = options.alert
      _foregroundBadge = options.badge
      _foregroundSound = options.sound
    }
  }

  // MARK: - Token

  func awaitToken() async -> String {
    return await withCheckedContinuation { continuation in
      lock.lock()
      if let token = _currentToken {
        lock.unlock()
        continuation.resume(returning: token)
      } else {
        _pendingTokenContinuations.append { token in
          continuation.resume(returning: token)
        }
        lock.unlock()
      }
    }
  }

  private func setupTokenObserver() {
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
    lock.lock()
    _currentToken = token
    let callback = _onTokenRefreshed
    let continuations = _pendingTokenContinuations
    _pendingTokenContinuations.removeAll()
    lock.unlock()
    callback?(token)
    continuations.forEach { $0(token) }
  }

  // MARK: - UNUserNotificationCenterDelegate

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping @Sendable (Int) -> Void
  ) {
    lock.lock()
    let alert = _foregroundAlert
    let badge = _foregroundBadge
    let sound = _foregroundSound
    let callback = _onNotificationReceived
    lock.unlock()
    var options: UNNotificationPresentationOptions = []
    if alert { options.insert(.banner) }
    if badge { options.insert(.badge) }
    if sound { options.insert(.sound) }
    let payload = notification.request.content.toNotificationPayload()
    callback?(payload)
    completionHandler(Int(options.rawValue))
  }

  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    lock.lock()
    let callback = _onNotificationTapped
    lock.unlock()
    let payload = response.notification.request.content.toNotificationPayload()
    let notifResponse = NotificationResponse(
      notification: payload,
      actionIdentifier: response.actionIdentifier
    )
    callback?(notifResponse)
    completionHandler()
  }
}
