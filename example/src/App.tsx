import { useEffect, useState } from 'react';
import {
  Button,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Notifications } from 'react-native-nitro-notification';
import type { PermissionStatus } from 'react-native-nitro-notification';

const requestPerms = async (setStatus: (s: PermissionStatus) => void) => {
  const status = await Notifications.requestPermissions();
  setStatus(status);
};

const getStatus = async (setStatus: (s: PermissionStatus) => void) => {
  const status = await Notifications.getPermissionStatus();
  setStatus(status);
};

const getToken = async (setToken: (t: string) => void) => {
  const token = await Notifications.getDevicePushToken();
  setToken(token);
};

const scheduleLocalNotification = async () => {
  const { default: PushNotificationIOS } = await import(
    '@react-native-community/push-notification-ios'
  ).catch(() => ({ default: null }));
  if (PushNotificationIOS) {
    PushNotificationIOS.addNotificationRequest({
      id: 'test-local',
      title: 'Test Notification',
      body: 'Hello from NitroNotification!',
    });
    return;
  }
  // Fallback: alert the user to install the dependency
  console.warn(
    'Install @react-native-community/push-notification-ios to test local notifications'
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontSize: 13, color: '#555', textAlign: 'center' },
  spacer: { height: 16 },
});
