import { View, Text, StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import { theme } from '../theme';

interface CardProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}

export function Card({ title, subtitle, right, children }: CardProps) {
  return (
    <View style={styles.card}>
      {(title || right) && (
        <View style={styles.head}>
          <View style={styles.headText}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space(4),
    gap: theme.space(3),
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.space(3) },
  headText: { flexShrink: 1, gap: 2 },
  title: { ...theme.text.title, color: theme.color.textPrimary },
  subtitle: { ...theme.text.body, fontSize: 12, color: theme.color.textMuted },
});
