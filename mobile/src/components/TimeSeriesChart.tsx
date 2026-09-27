import { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, type LayoutChangeEvent } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { theme } from '../theme';
import type { SeriesPoint } from '../types';

const HEIGHT = 168;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

/** Labels arrive as YYYY-MM-DD, YYYY-MM or YYYY depending on the range. */
function formatLabel(raw: string): string {
  const parts = raw.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (parts.length >= 3) return `${Number(parts[2])} ${months[Number(parts[1]) - 1] ?? ''}`.trim();
  if (parts.length === 2) return `${months[Number(parts[1]) - 1] ?? ''} ${parts[0].slice(2)}`.trim();
  return raw;
}

export function TimeSeriesChart({ data }: { data: SeriesPoint[] }) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const widthRef = useRef(0);
  const countRef = useRef(data.length);
  countRef.current = data.length;

  const onLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    widthRef.current = next;
    setWidth(next);
  };

  const pick = (x: number) => {
    const w = widthRef.current;
    const count = countRef.current;
    if (!w || count < 2) return;
    const index = Math.round((x / w) * (count - 1));
    setActive(Math.max(0, Math.min(count - 1, index)));
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Only take over from the scroll view for clearly horizontal drags.
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (event) => pick(event.nativeEvent.locationX),
      onPanResponderMove: (event) => pick(event.nativeEvent.locationX),
      onPanResponderRelease: () => setActive(null),
      onPanResponderTerminate: () => setActive(null),
    })
  ).current;

  const geometry = useMemo(() => {
    if (!width || data.length < 2) return null;
    const max = Math.max(...data.map((d) => d.value), 1);
    const plot = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const x = (i: number) => (i / (data.length - 1)) * width;
    const y = (v: number) => PAD_TOP + plot - (v / max) * plot;
    const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(d.value).toFixed(2)}`).join(' ');
    const area = `${line} L${width},${PAD_TOP + plot} L0,${PAD_TOP + plot} Z`;
    const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
    return { max, plot, x, y, line, area, peak };
  }, [data, width]);

  const shown = active ?? geometry?.peak ?? null;
  const shownPoint = shown != null ? data[shown] : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.readout}>
        <Text style={styles.readoutValue}>
          {shownPoint ? shownPoint.value.toLocaleString() : '—'}
          <Text style={styles.readoutUnit}> visits</Text>
        </Text>
        <Text style={styles.readoutLabel}>
          {shownPoint ? formatLabel(shownPoint.label) : ''}
          {active == null && shownPoint ? ' · busiest' : ''}
        </Text>
      </View>

      <View style={styles.plot} onLayout={onLayout} {...responder.panHandlers}>
        {geometry && (
          <Svg width={width} height={HEIGHT}>
            {[0, 0.5, 1].map((fraction) => (
              <Line
                key={fraction}
                x1={0}
                x2={width}
                y1={PAD_TOP + geometry.plot * fraction}
                y2={PAD_TOP + geometry.plot * fraction}
                stroke={theme.color.border}
                strokeWidth={1}
              />
            ))}
            <Path d={geometry.area} fill={theme.color.series1Soft} />
            <Path
              d={geometry.line}
              stroke={theme.color.series1}
              strokeWidth={2}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {shown != null && (
              <>
                <Line
                  x1={geometry.x(shown)}
                  x2={geometry.x(shown)}
                  y1={PAD_TOP}
                  y2={PAD_TOP + geometry.plot}
                  stroke={theme.color.borderStrong}
                  strokeWidth={1}
                />
                <Circle
                  cx={geometry.x(shown)}
                  cy={geometry.y(data[shown].value)}
                  r={5}
                  fill={theme.color.series1}
                  stroke={theme.color.surface}
                  strokeWidth={2}
                />
              </>
            )}
          </Svg>
        )}
        <Text style={[styles.axis, styles.axisMax]}>{geometry ? geometry.max.toLocaleString() : ''}</Text>
      </View>

      <View style={styles.xAxis}>
        <Text style={styles.axis}>{data.length ? formatLabel(data[0].label) : ''}</Text>
        <Text style={styles.axis}>{data.length ? formatLabel(data[data.length - 1].label) : ''}</Text>
      </View>
      <Text style={styles.hint}>Drag across the chart to read a day</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: theme.space(2) },
  readout: { gap: 1 },
  readoutValue: { fontSize: 26, fontWeight: '700', color: theme.color.textPrimary, ...theme.text.mono },
  readoutUnit: { fontSize: 13, fontWeight: '400', color: theme.color.textMuted },
  readoutLabel: { fontSize: 12, color: theme.color.textSecondary },
  plot: { height: HEIGHT, justifyContent: 'center' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between' },
  axis: { fontSize: 11, color: theme.color.textMuted, ...theme.text.mono },
  axisMax: { position: 'absolute', right: 0, top: 0 },
  hint: { fontSize: 11, color: theme.color.textMuted, marginTop: 2 },
});
