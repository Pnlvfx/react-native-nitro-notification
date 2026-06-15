import { useNavigation } from '@react-navigation/native';
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
import { useNotification } from '../context/NotificationContext';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { permStatus, token, lastReceived, requestPermissions, unregister } =
    useNotification();

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
          onPress={requestPermissions}
          disabled={permStatus === 'granted' || permStatus === 'denied'}
        />
      </Section>

      <Pressable onPress={copyToken}>
        <Text style={styles.tokenText}>
          {token ? `Token: ${token.slice(0, 20)}…` : 'Token: none'}
        </Text>
      </Pressable>

      <Section label="Last Received">
        <Text testID="last-event-text" style={styles.eventText}>
          {lastReceived ?? 'None'}
        </Text>
      </Section>

      <Section label="Actions">
        <Button title="Settings" onPress={goToSettings} />
        <Button
          title="Unregister"
          color="#c0392b"
          onPress={unregister}
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
    padding: 24,
    gap: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  tokenText: { color: '#2c3e50', fontSize: 13 },
  eventText: { fontSize: 13, color: '#222', textAlign: 'center' },
});
