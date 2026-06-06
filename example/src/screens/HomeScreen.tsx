import { useNavigation } from '@react-navigation/native';
import {
  type PermissionStatus,
  Notifications,
} from 'react-native-nitro-notification';
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
import { Section } from '../components/section';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [permStatus, setPermStatus] =
    useState<PermissionStatus>('undetermined');
  const [token, setToken] = useState<string | undefined>(undefined);
  const [lastReceived, setLastReceived] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      const status = await Notifications.getPermissionStatus();
      if (active) setPermStatus(status);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    let active = true;
    const load = async () => {
      const t = await Notifications.getDevicePushToken();
      if (active) setToken(t);
    };
    load();
    return () => {
      active = false;
    };
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    const sub = Notifications.addOnTokenRefreshed((t) => setToken(t));
    return () => sub.remove();
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    const sub = Notifications.addOnNotificationReceived((n) => {
      setLastReceived(`${n.title ?? '(no title)'} — ${n.body ?? '(no body)'}`);
    });
    return () => sub.remove();
  }, [permStatus]);

  useEffect(() => {
    if (permStatus !== 'granted' && permStatus !== 'provisional') return;
    Notifications.setForegroundPresentationOptions({
      alert: true,
      badge: true,
      sound: true,
    });
  }, [permStatus]);

  const handleRequestPermissions = async () => {
    const status = await Notifications.requestPermissions();
    setPermStatus(status);
  };

  const handleUnregister = async () => {
    await Notifications.unregisterForNotifications();
    setToken(undefined);
    Alert.alert('Unregistered', 'Token removed from device.');
  };

  const copyToken = () => {
    if (!token) return;
    Clipboard.setString(token);
    Alert.alert('Copied', 'Push token copied to clipboard.');
  };

  const goToSettings = () => navigation.navigate('Settings');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nitro Notifications</Text>

      <Section label={`Permission: ${permStatus}`}>
        <Button
          title="Request Permissions"
          onPress={handleRequestPermissions}
          disabled={permStatus === 'granted' || permStatus === 'denied'}
        />
      </Section>

      <Pressable onPress={copyToken}>
        <Text style={styles.tokenText}>
          {token ? `Token: ${token.slice(0, 20)}…` : 'Token: none'}
        </Text>
      </Pressable>

      <Section label="Last Received">
        <Text testID="last-received-text" style={styles.eventText}>
          {lastReceived ?? 'None'}
        </Text>
      </Section>

      <Section label="Actions">
        <Button title="Settings" onPress={goToSettings} />
        <Button
          title="Unregister"
          color="#c0392b"
          onPress={handleUnregister}
          disabled={!token}
        />
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  tokenText: { color: '#2c3e50', fontSize: 13 },
  eventText: { fontSize: 13, color: '#222', textAlign: 'center' },
});
