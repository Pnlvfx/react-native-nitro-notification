import { Notifications, type ForegroundPresentationOptions } from 'react-native-nitro-notification';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export const SettingsScreen = () => {
  const [options, setOptions] = useState<ForegroundPresentationOptions>({
    alert: true,
    badge: true,
    sound: true,
  });

  useEffect(() => {
    Notifications.setForegroundPresentationOptions(options);
  }, [options]);

  const toggle = (key: keyof ForegroundPresentationOptions) => {
    setOptions((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      return next;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{'Notification Settings'}</Text>
      <Text style={styles.subtitle}>{'Foreground Presentation'}</Text>

      <View style={styles.card}>
        <Row
          description="Display banner when app is in foreground"
          label="Show Alert"
          onToggle={() => {
            toggle('alert');
          }}
          value={options.alert}
        />
        <View style={styles.divider} />
        <Row description="Increment app icon badge count" label="Update Badge" onToggle={() => toggle('badge')} value={options.badge ?? false} />
        <View style={styles.divider} />
        <Row description="Play notification sound" label="Play Sound" onToggle={() => toggle('sound')} value={options.sound ?? false} />
      </View>

      <Text style={styles.hint}>Changes apply immediately to the next foreground notification.</Text>
    </ScrollView>
  );
};

const Row = ({
  label,
  description,
  value,
  onToggle,
}: {
  readonly label: string;
  readonly description: string;
  readonly value: boolean;
  readonly onToggle: () => void;
}) => (
  <View style={styles.row}>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowDescription}>{description}</Text>
    </View>
    <Switch onValueChange={onToggle} value={value} />
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, gap: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#111' },
  rowDescription: { fontSize: 12, color: '#888', marginTop: 2 },
  hint: { fontSize: 12, color: '#aaa', textAlign: 'center' },
});
