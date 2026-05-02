import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Section = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <View style={section}>
    <Text style={labelStyle}>{label}</Text>
    {children}
  </View>
);

const { section, labelStyle } = StyleSheet.create({
  section: { alignItems: 'center', gap: 8, width: '100%' },
  labelStyle: { fontSize: 13, color: '#555', textAlign: 'center' },
});
