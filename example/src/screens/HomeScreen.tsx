import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { Alert, Button, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Section } from '../components/section';
import { useNotification } from '../context/NotificationContext';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { permStatus, token, lastReceived, requestPermissions, unregister } = useNotification();

  const copyToken = () => {
    if (!token) return;
    Clipboard.setString(token);
    Alert.alert('Copied', 'Push token copied to clipboard.');
  };

  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{'Nitro Notifications'}</Text>
      <Section label={`Permission: ${permStatus}`}>
        <Button disabled={permStatus === 'granted' || permStatus === 'denied'} onPress={requestPermissions} title="Request Permissions" />
      </Section>
      <Pressable onPress={copyToken}>
        <Text style={styles.tokenText}>{token ? `Token: ${token.slice(0, 20)}…` : 'Token: none'}</Text>
      </Pressable>
      <Section label="Last Received">
        <Text style={styles.eventText} testID="last-event-text">
          {lastReceived ?? 'None'}
        </Text>
      </Section>
      <Section label="Actions">
        <Button onPress={goToSettings} title="Settings" />
        <Button color="#c0392b" disabled={!token} onPress={unregister} title="Unregister" />
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', padding: 24, gap: 24 },
  title: { fontSize: 22, fontWeight: 'bold' },
  tokenText: { color: '#2c3e50', fontSize: 13 },
  eventText: { fontSize: 13, color: '#222', textAlign: 'center' },
});
