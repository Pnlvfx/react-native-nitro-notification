import type { StaticScreenProps } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Section } from '../components/section';

export type NotificationDetailParams = {
  notificationTitle: string;
  notificationBody: string;
  notificationData: string;
  actionIdentifier: string;
};

type Props = StaticScreenProps<NotificationDetailParams>;

export const NotificationDetailScreen = ({ route }: Props) => {
  const {
    notificationTitle,
    notificationBody,
    notificationData,
    actionIdentifier,
  } = route.params;

  const parsedData = (() => {
    try {
      return JSON.parse(notificationData) as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  })();

  const dataEntries = Object.entries(parsedData);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notification Detail</Text>

      <Section label="Title">
        <Text style={styles.value}>{notificationTitle || '(none)'}</Text>
      </Section>

      <Section label="Body">
        <Text style={styles.value}>{notificationBody || '(none)'}</Text>
      </Section>

      <Section label="Action">
        <Text style={styles.value}>{actionIdentifier}</Text>
      </Section>

      <Section label="Data">
        {dataEntries.length === 0 ? (
          <Text style={styles.value}>(empty)</Text>
        ) : (
          dataEntries.map(([key, val]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key}:</Text>
              <Text style={styles.value}>{val}</Text>
            </View>
          ))
        )}
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  key: { fontWeight: '600', fontSize: 13, color: '#555' },
  value: { fontSize: 13, color: '#222' },
});
