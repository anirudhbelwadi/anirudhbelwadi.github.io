import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import type { DeviceSplit as Split } from '../types';

/**
 * Two categories, so one stacked bar rather than a pie: the 2px gap and the
 * direct labels carry the split without relying on colour alone.
 */
export function DeviceSplitBar({ split }: { split: Split }) {
  const total = split.mobile_count + split.web_count;
  const segments = [
    { key: 'Mobile', count: split.mobile_count, pct: split.mobile_pct, color: theme.color.series1 },
    { key: 'Desktop', count: split.web_count, pct: split.web_pct, color: theme.color.series2 },
  ];

  if (!total) return <Text style={styles.empty}>No device data yet.</Text>;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {segments.map((segment, index) =>
          segment.count > 0 ? (
            <View
              key={segment.key}
              style={{
                flex: segment.count,
                backgroundColor: segment.color,
                marginLeft: index > 0 ? 2 : 0,
                borderTopLeftRadius: index === 0 ? 4 : 0,
                borderBottomLeftRadius: index === 0 ? 4 : 0,
                borderTopRightRadius: index === segments.length - 1 ? 4 : 0,
                borderBottomRightRadius: index === segments.length - 1 ? 4 : 0,
              }}
            />
          ) : null
        )}
      </View>
      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.key} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: segment.color }]} />
            <Text style={styles.legendLabel}>{segment.key}</Text>
            <Text style={styles.legendValue}>
              {segment.pct}% <Text style={styles.legendCount}>({segment.count.toLocaleString()})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.space(3) },
  bar: { flexDirection: 'row', height: 14, borderRadius: 4, overflow: 'hidden' },
  legend: { gap: theme.space(2) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: theme.space(2) },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  legendLabel: { ...theme.text.body, color: theme.color.textSecondary, flex: 1 },
  legendValue: { ...theme.text.body, fontWeight: '600', color: theme.color.textPrimary, ...theme.text.mono },
  legendCount: { color: theme.color.textMuted, fontWeight: '400' },
  empty: { ...theme.text.body, color: theme.color.textMuted },
});
