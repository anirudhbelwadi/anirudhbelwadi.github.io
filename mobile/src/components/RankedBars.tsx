import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';
import type { SeriesPoint } from '../types';

const BAR_HEIGHT = 10;
const RADIUS = 4;

/** A bar anchored at the baseline with only its data end rounded. */
function barPath(width: number, height: number, radius: number) {
  const r = Math.min(radius, width, height / 2);
  if (width <= 0) return '';
  return [
    `M0,0`,
    `H${width - r}`,
    `A${r},${r} 0 0 1 ${width},${r}`,
    `V${height - r}`,
    `A${r},${r} 0 0 1 ${width - r},${height}`,
    `H0`,
    'Z',
  ].join(' ');
}

interface RankedBarsProps {
  data: SeriesPoint[];
  /** Rendered after the value, e.g. "visits". */
  unit?: string;
  emptyMessage?: string;
}

export function RankedBars({ data, unit, emptyMessage = 'No data yet.' }: RankedBarsProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  if (!data.length) return <Text style={styles.empty}>{emptyMessage}</Text>;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.list} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
      {data.map((point) => {
        const width = trackWidth > 0 ? Math.max((point.value / max) * trackWidth, point.value > 0 ? 3 : 0) : 0;
        return (
          <View key={point.label} style={styles.row}>
            <View style={styles.rowHead}>
              <Text style={styles.name} numberOfLines={1}>{point.label || 'Direct'}</Text>
              <Text style={styles.value}>
                {point.value.toLocaleString()}
                {unit ? <Text style={styles.unit}> {unit}</Text> : null}
              </Text>
            </View>
            <Svg width="100%" height={BAR_HEIGHT}>
              <Path d={barPath(width, BAR_HEIGHT, RADIUS)} fill={theme.color.series1} />
            </Svg>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.space(3) },
  row: { gap: 5 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: theme.space(3) },
  name: { ...theme.text.body, color: theme.color.textSecondary, flexShrink: 1 },
  value: { ...theme.text.body, fontWeight: '600', color: theme.color.textPrimary, ...theme.text.mono },
  unit: { color: theme.color.textMuted, fontWeight: '400', fontSize: 12 },
  empty: { ...theme.text.body, color: theme.color.textMuted },
});
