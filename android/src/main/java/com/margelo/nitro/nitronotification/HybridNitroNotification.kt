package com.margelo.nitro.nitronotification

import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise

@DoNotStrip
class NitroNotification : HybridNitroNotificationSpec() {
  override fun requestPermissions(): Promise<PermissionStatus> =
    Promise.rejected(UnsupportedOperationException("NitroNotification is not yet supported on Android"))

  override fun getPermissionStatus(): Promise<PermissionStatus> =
    Promise.rejected(UnsupportedOperationException("NitroNotification is not yet supported on Android"))

  override fun getDevicePushToken(): Promise<String> =
    Promise.rejected(UnsupportedOperationException("NitroNotification is not yet supported on Android"))

  override fun unregisterForNotifications(): Promise<Unit> =
    Promise.rejected(UnsupportedOperationException("NitroNotification is not yet supported on Android"))

  override fun setOnTokenRefreshed(callback: (token: String) -> Unit) = Unit

  override fun setOnNotificationReceived(callback: (notification: NotificationPayload) -> Unit) = Unit

  override fun setOnNotificationTapped(callback: (response: NotificationResponse) -> Unit) = Unit

  override fun setForegroundPresentationOptions(options: ForegroundPresentationOptions) = Unit
}
