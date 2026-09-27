import { useCallback, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAnalytics, ApiError } from '../api';
import { useSession } from '../session';
import { theme } from '../theme';
import type { Analytics } from '../types';
import { Card } from '../components/Card';
import { KpiTile } from '../components/KpiTile';
import { RankedBars } from '../components/RankedBars';
import { DeviceSplitBar } from '../components/DeviceSplit';
import { TimeSeriesChart } from '../components/TimeSeriesChart';

const RANGES = [
  { key: 'week', label: '7 days' },
  { key: 'month', label: '30 days' },
  { key: 'year', label: '12 months' },
  { key: 'fiveYears', label: '5 years' },
] as const;

type RangeKey = (typeof RANGES)[number]['key'];

export function DashboardScreen() {
  const { token, signOut } = useSession();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<RangeKey>('week');

  const load = useCallback(async () => {
    try {
      setData(await fetchAnalytics(token));
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.needsLogin) return signOut();
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    }
  }, [token, signOut]);

  useEffect(() => { void load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!data) {
    return (
      <SafeAreaView style={styles.centre} edges={['top']}>
        {error ? (
          <>
            <Text style={styles.errorTitle}>Can't load analytics</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <Pressable style={styles.retry} onPress={load} accessibilityRole="button">
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator color={theme.color.series1} />
        )}
      </SafeAreaView>
    );
  }

  const { kpis } = data;
  const updated = new Date(data.generatedAt);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.color.series1} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.heading}>Overview</Text>
            <Text style={styles.sub}>
              {data.total.toLocaleString()} visits all time · updated{' '}
              {updated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}

        <View style={styles.tiles}>
          <KpiTile label="Today" value={kpis.todays_visitors} />
          <KpiTile label="This week" value={kpis.visits_this_week} />
          <KpiTile label="This month" value={kpis.visits_this_month} />
          <KpiTile label="Avg / day" value={kpis.avg_per_day} note={`${kpis.avg_per_week} per week`} />
          <KpiTile label="Busiest day" value={kpis.peak_day_count} note={kpis.peak_day} />
          <KpiTile label="Repeat / day" value={kpis.repeat_visitors_per_day} note={`${kpis.repeat_visitors_last_24h} in last 24h`} />
        </View>

        <Card title="Visits over time">
          <View style={styles.ranges}>
            {RANGES.map((option) => {
              const selected = option.key === range;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setRange(option.key)}
                  style={[styles.range, selected && styles.rangeOn]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text style={[styles.rangeText, selected && styles.rangeTextOn]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <TimeSeriesChart data={data.series[range]} />
        </Card>

        <Card title="Top countries" subtitle={`Leading: ${kpis.top_country}`}>
          <RankedBars data={data.countries} unit="visits" />
        </Card>

        <Card title="Top sources" subtitle={`Leading: ${kpis.top_source}`}>
          <RankedBars data={data.sources} unit="visits" />
        </Card>

        <Card title="Mobile vs desktop">
          <DeviceSplitBar split={kpis.device_split} />
        </Card>

        <Card title="Top cities">
          <RankedBars
            data={kpis.top_locations.map((location) => ({ label: location.city, value: location.count }))}
            unit="visits"
          />
        </Card>

        <Pressable onPress={signOut} style={styles.signOut} accessibilityRole="button">
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background },
  content: { padding: theme.space(4), paddingBottom: theme.space(8), gap: theme.space(4) },
  centre: { flex: 1, backgroundColor: theme.color.background, alignItems: 'center', justifyContent: 'center', padding: theme.space(6), gap: theme.space(3) },
  header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerText: { gap: 2, flexShrink: 1 },
  heading: { ...theme.text.display, color: theme.color.textPrimary },
  sub: { ...theme.text.body, fontSize: 12, color: theme.color.textMuted },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2.5) },
  ranges: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  range: {
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.color.border,
  },
  rangeOn: { backgroundColor: theme.color.series1, borderColor: theme.color.series1 },
  rangeText: { fontSize: 13, color: theme.color.textSecondary },
  rangeTextOn: { color: '#0b1a2e', fontWeight: '700' },
  errorTitle: { ...theme.text.title, color: theme.color.textPrimary },
  errorBody: { ...theme.text.body, color: theme.color.textSecondary, textAlign: 'center' },
  inlineError: { ...theme.text.body, color: theme.color.danger },
  retry: { paddingHorizontal: theme.space(5), paddingVertical: theme.space(3), borderRadius: theme.radius.md, backgroundColor: theme.color.series1 },
  retryText: { fontWeight: '700', color: '#0b1a2e' },
  signOut: { alignSelf: 'flex-start', paddingVertical: theme.space(3), paddingHorizontal: theme.space(4), borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.color.border },
  signOutText: { ...theme.text.body, color: theme.color.textSecondary },
});
