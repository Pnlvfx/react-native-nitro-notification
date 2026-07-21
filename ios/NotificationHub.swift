import Foundation
import NitroModules
import UserNotifications

private let defaultHandlerTimeoutMs: Double = 5000

private let fallbackPresentationOptions = NotificationPresentationOptions(
  alert: true,
  badge: true,
  sound: true
)

final class NotificationHub: NSObject, UNUserNotificationCenterDelegate {
  static let shared = NotificationHub()

  private let lock = NSLock()

  private var _onTokenRefreshed: ((String) -> Void)?
  private var _onNotificationTapped: ((NotificationResponse) -> Void)?
  private var _notificationHandler: ((NotificationPayload) -> Promise<Promise<NotificationPresentationOptions>>)?
  private var _handlerTimeoutMs: Double = defaultHandlerTimeoutMs

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

  func setOnNotificationTapped(_ callback: ((NotificationResponse) -> Void)?) {
    lock.withLock { _onNotificationTapped = callback }
  }

  func setNotificationHandler(
    _ handler: ((NotificationPayload) -> Promise<Promise<NotificationPresentationOptions>>)?,
    handlerTimeoutMs: Double?
  ) {
    lock.withLock {
      _notificationHandler = handler
      _handlerTimeoutMs = handlerTimeoutMs ?? defaultHandlerTimeoutMs
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
    let handler = _notificationHandler
    let timeoutMs = _handlerTimeoutMs
    lock.unlock()

    let payload = notification.request.content.toNotificationPayload()

    switch handler {
    case .none:
      completionHandler(Int(presentationOptionsMask(from: fallbackPresentationOptions).rawValue))
    case .some(let handler):
      Task {
        let resolved = await resolvePresentationOptions(
          handler: handler,
          payload: payload,
          timeoutMs: timeoutMs
        )
        completionHandler(Int(presentationOptionsMask(from: resolved).rawValue))
      }
    }
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

private func presentationOptionsMask(from options: NotificationPresentationOptions) -> UNNotificationPresentationOptions {
  var mask: UNNotificationPresentationOptions = []
  if options.alert { mask.insert(.banner) }
  if options.badge { mask.insert(.badge) }
  if options.sound { mask.insert(.sound) }
  return mask
}

private enum PresentationRaceOutcome {
  case resolved(NotificationPresentationOptions)
  case rejected
  case timedOut
}

private func resolvePresentationOptions(
  handler: (NotificationPayload) -> Promise<Promise<NotificationPresentationOptions>>,
  payload: NotificationPayload,
  timeoutMs: Double
) async -> NotificationPresentationOptions {
  let outerPromise = handler(payload)
  let outcome = await withTaskGroup(of: PresentationRaceOutcome.self) { group in
    group.addTask {
      do {
        let innerPromise = try await outerPromise.await()
        let resolved = try await innerPromise.await()
        return .resolved(resolved)
      } catch {
        return .rejected
      }
    }
    group.addTask {
      try? await Task.sleep(nanoseconds: UInt64(timeoutMs * 1_000_000))
      return .timedOut
    }
    let first = await group.next() ?? .timedOut
    group.cancelAll()
    return first
  }
  switch outcome {
  case .resolved(let options):
    return options
  case .rejected, .timedOut:
    return fallbackPresentationOptions
  }
}
