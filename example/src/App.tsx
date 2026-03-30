import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Clipboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Notifications } from 'react-native-nitro-notification';
import type { PermissionStatus } from 'react-native-nitro-notification';

const SERVER = 'http://192.168.1.111:8192';

export default function App() {
  const [permStatus, setPermStatus] =
    useState<PermissionStatus>('undetermined');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [lastEvent, setLastEvent] = useState<string | undefined>(undefined);

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
    Notifications.setForegroundPresentationOptions(true, true, true);
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

  const handleRequestPermissions = async () => {
    const status = await Notifications.requestPermissions();
    setPermStatus(status);
    if (status === 'granted') {
      setupNotifications();
      const t = await Notifications.getDevicePushToken();
      setToken(t);
    }
  };

  const handleRegisterToken = async () => {
    if (!token) return;
    const res = await fetch(`${SERVER}/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: 'ios', sandbox: true }),
    });
    if (res.ok) {
      Alert.alert('Registered', 'Token sent to server.');
    } else {
      Alert.alert('Error', `Server responded with ${res.status}`);
    }
  };

  const handleSendTestPush = async () => {
    if (!token) return;
    const res = await fetch(`${SERVER}/push/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceToken: token,
        title: 'Test notification',
        body: 'Sent from the example app',
        sandbox: true,
      }),
    });
    if (!res.ok) {
      Alert.alert('Error', `Server responded with ${res.status}`);
    }
  };

  const handleReset = () => {
    setPermStatus('undetermined');
    setToken(undefined);
    setLastEvent(undefined);
  };

  const handleUnregister = async () => {
    if (token) {
      await fetch(`${SERVER}/push/register`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
    await Notifications.unregisterForNotifications();
    setToken(undefined);
    setLastEvent(undefined);
    Alert.alert('Unregistered', 'Token removed from server and device.');
  };

  const copyToken = () => {
    if (!token) return;
    Clipboard.setString(token);
    Alert.alert('Copied');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nitro Notifications</Text>
      <Section label={`Permission: ${permStatus}`}>
        <Button
          title="Request Permissions"
          onPress={handleRequestPermissions}
          disabled={permStatus === 'granted'}
        />
      </Section>
      <Pressable onPress={copyToken}>
        <Text style={{ color: 'white' }}>
          {token ? `Token: ${token.slice(0, 16)}…` : 'Token: none'}
        </Text>
      </Pressable>
      <Section label="In">
        <Button
          title="Register Token with Server"
          onPress={handleRegisterToken}
          disabled={!token}
        />
        <Button
          title="Send Test Push"
          onPress={handleSendTestPush}
          disabled={!token}
        />
        <Button title="Unregister" color="#c0392b" onPress={handleUnregister} />
        <Button title="Reset UI" color="#7f8c8d" onPress={handleReset} />
      </Section>
      <Section label="Last Event">
        <Text style={styles.event}>{lastEvent ?? 'None'}</Text>
      </Section>
    </ScrollView>
  );
}

const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  section: { alignItems: 'center', gap: 8, width: '100%' },
  label: { fontSize: 13, color: '#555', textAlign: 'center' },
  event: { fontSize: 13, color: '#222', textAlign: 'center' },
});
