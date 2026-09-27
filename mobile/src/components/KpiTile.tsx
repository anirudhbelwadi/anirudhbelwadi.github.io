import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface KpiTileProps {
  label: string;
  value: string | number;
  note?: string;
}

export function KpiTile({ label, value, note }: KpiTileProps) {
  return (
    <View style={styles.tile}>
      <Text style={styles.label} numberOfLines={1}>{label.toUpperCase()}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {value}
      </Text>
      {note ? <Text style={styles.note} numberOfLines={2}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexGrow: 1,
    flexBasis: '47%',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    paddingVertical: theme.space(3),
    paddingHorizontal: theme.space(3.5),
    gap: 3,
  },
  label: { ...theme.text.label, color: theme.color.textMuted },
  value: { fontSize: 26, fontWeight: '700', color: theme.color.textPrimary, ...theme.text.mono },
  note: { fontSize: 12, color: theme.color.textSecondary },
});
