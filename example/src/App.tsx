import type { PermissionStatus } from 'react-native-nitro-notification';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Clipboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Notifications } from 'react-native-nitro-notification';
import { Section } from './components/section';

export default function App() {
  const [permStatus, setPermStatus] =
    useState<PermissionStatus>('undetermined');
  const [token, setToken] = useState<string>();
  const [lastEvent, setLastEvent] = useState<string>();

  const setupNotifications = () => {
    Notifications.setOnTokenRefreshed((t) => {
      setToken(t);
    });
    Notifications.setOnNotificationReceived((n) => {
      setLastEvent(`Received: ${n.title ?? ''} — ${n.body ?? ''}`);
    });
    Notifications.setOnNotificationTapped((r) => {
      setLastEvent(
        `Tapped: ${r.notification.title ?? ''} (${r.actionIdentifier})`
      );
    });
    Notifications.setForegroundPresentationOptions({
      alert: true,
      badge: true,
      sound: true,
    });
  };

  const handleRequestPermissions = async () => {
    const status = await Notifications.requestPermissions();
    setPermStatus(status);
    if (status === 'granted') {
      setupNotifications();
      const t = await Notifications.getDevicePushToken();
      setToken(t);
    }
  };

  const handleReset = () => {
    setPermStatus('undetermined');
    setToken(undefined);
    setLastEvent(undefined);
  };

  const handleUnregister = async () => {
    await Notifications.unregisterForNotifications();
    setToken(undefined);
    setLastEvent(undefined);
    Alert.alert('Unregistered', 'Token removed from device.');
  };

  const copyToken = () => {
    if (!token) return;
    Clipboard.setString(token);
    Alert.alert('Copied');
  };

  useEffect(() => {
    (async () => {
      const status = await Notifications.getPermissionStatus();
      setPermStatus(status);
      if (status === 'granted') {
        setupNotifications();
        const t = await Notifications.getDevicePushToken();
        setToken(t);
      }
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={container}>
      <Text style={title}>Nitro Notifications</Text>
      <Section label={`Permission: ${permStatus}`}>
        <Button
          title="Request Permissions"
          onPress={handleRequestPermissions}
          disabled={permStatus === 'granted' || permStatus === 'denied'}
        />
      </Section>
      <Pressable onPress={copyToken}>
        <Text style={tokenText}>
          {token ? `Token: ${token.slice(0, 16)}…` : 'Token: none'}
        </Text>
      </Pressable>
      <Section label="Actions">
        <Button
          title="Unregister"
          color="#c0392b"
          onPress={handleUnregister}
          disabled={!token}
        />
        <Button title="Reset UI" color="#7f8c8d" onPress={handleReset} />
      </Section>
      <Section label="Last Event">
        <Text testID="last-event-text" style={event}>
          {lastEvent ?? 'None'}
        </Text>
      </Section>
    </ScrollView>
  );
}

const { container, title, tokenText, event } = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  tokenText: { color: 'white' },
  event: { fontSize: 13, color: '#222', textAlign: 'center' },
});
