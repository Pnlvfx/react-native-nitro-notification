import UserNotifications

extension UNNotificationContent {
  func toNotificationPayload() -> NotificationPayload {
    var data: [String: String]?
    if !userInfo.isEmpty {
      var dict: [String: String] = [:]
      for (key, value) in userInfo {
        if let k = key as? String, let v = value as? String {
          dict[k] = v
        }
      }
      data = dict.isEmpty ? nil : dict
    }
    return NotificationPayload(
      title: title.isEmpty ? nil : title,
      body: body.isEmpty ? nil : body,
      data: data,
      badge: badge.map { Double($0.intValue) }
    )
  }
}
