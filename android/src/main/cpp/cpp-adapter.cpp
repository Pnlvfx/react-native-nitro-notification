#include <jni.h>
#include "nitronotificationOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitronotification::initialize(vm);
}
