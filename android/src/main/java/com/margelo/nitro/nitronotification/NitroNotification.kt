package com.margelo.nitro.nitronotification
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class NitroNotification : HybridNitroNotificationSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
