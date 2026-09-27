import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchVisitors, ApiError } from '../api';
import { useSession } from '../session';
import { theme } from '../theme';
import type { Visitor } from '../types';

const PAGE_SIZE = 40;

function VisitorRow({ visitor }: { visitor: Visitor }) {
  const place = [visitor.city, visitor.country].filter(Boolean).join(', ') || 'Unknown location';
  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.rowName} numberOfLines={1}>
          {visitor.name || place}
        </Text>
        <Text style={styles.rowTime}>{visitor.timestamp}</Text>
      </View>
      <Text style={styles.rowMeta} numberOfLines={1}>
        {visitor.name ? `${place} · ` : ''}
        {visitor.source || 'Direct'}
      </Text>
      <View style={styles.chips}>
        {visitor.role ? <Chip text={visitor.role} /> : null}
        <Chip text={visitor.isMobile ? 'Mobile' : 'Desktop'} />
        {visitor.isRepeatVisitor ? <Chip text="Repeat" accent /> : null}
        <Text style={styles.ip}>{visitor.ip}</Text>
      </View>
    </View>
  );
}

function Chip({ text, accent }: { text: string; accent?: boolean }) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={[styles.chipText, accent && styles.chipTextAccent]}>{text}</Text>
    </View>
  );
}

export function VisitorsScreen() {
  const { token, signOut } = useSession();
  const [items, setItems] = useState<Visitor[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(
    async (searchTerm: string, offset: number) => {
      const id = ++requestId.current;
      try {
        const page = await fetchVisitors(token, { limit: PAGE_SIZE, offset, q: searchTerm });
        // A slower earlier request must not overwrite newer results.
        if (id !== requestId.current) return;
        setItems((previous) => (offset === 0 ? page.items : [...previous, ...page.items]));
        setTotal(page.total);
        setError(null);
      } catch (err) {
        if (id !== requestId.current) return;
        if (err instanceof ApiError && err.needsLogin) return signOut();
        setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      }
    },
    [token, signOut]
  );

  // Debounce so a search does not fire a request per keystroke.
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(async () => {
      await load(query, 0);
      setLoading(false);
    }, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [query, load]);

  const loadMore = async () => {
    if (loadingMore || loading || items.length >= total) return;
    setLoadingMore(true);
    await load(query, items.length);
    setLoadingMore(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    await load(query, 0);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>Visitors</Text>
        <Text style={styles.sub}>
          {loading ? 'Loading…' : `${total.toLocaleString()} ${query ? 'matching' : 'recorded'}`}
        </Text>
        <TextInput
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, city, country, source"
          placeholderTextColor={theme.color.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search visitors"
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.ip}-${item.timestamp}-${index}`}
        renderItem={({ item }) => <VisitorRow visitor={item} />}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.color.series1} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={theme.color.series1} style={styles.spinner} />
          ) : (
            <Text style={styles.empty}>{query ? 'No visitors match that search.' : 'No visits recorded yet.'}</Text>
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator color={theme.color.series1} style={styles.spinner} /> : null}
        keyboardDismissMode="on-drag"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.color.background },
  header: { paddingHorizontal: theme.space(4), paddingTop: theme.space(3), paddingBottom: theme.space(3), gap: theme.space(2) },
  heading: { ...theme.text.display, color: theme.color.textPrimary },
  sub: { ...theme.text.body, fontSize: 12, color: theme.color.textMuted },
  search: {
    backgroundColor: theme.color.surface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.space(3.5),
    paddingVertical: theme.space(3),
    color: theme.color.textPrimary,
    fontSize: 15,
    marginTop: theme.space(1),
  },
  list: { paddingHorizontal: theme.space(4), paddingBottom: theme.space(8), gap: theme.space(2.5) },
  row: {
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.color.border,
    padding: theme.space(3.5),
    gap: 5,
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: theme.space(2) },
  rowName: { ...theme.text.title, fontSize: 15, color: theme.color.textPrimary, flexShrink: 1 },
  rowTime: { fontSize: 11, color: theme.color.textMuted, ...theme.text.mono },
  rowMeta: { ...theme.text.body, fontSize: 13, color: theme.color.textSecondary },
  chips: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: theme.space(1.5), marginTop: 2 },
  chip: { paddingHorizontal: theme.space(2), paddingVertical: 3, borderRadius: 999, backgroundColor: theme.color.surfaceRaised },
  chipAccent: { backgroundColor: 'rgba(57, 135, 229, 0.22)' },
  chipText: { fontSize: 11, color: theme.color.textSecondary, textTransform: 'capitalize' },
  chipTextAccent: { color: theme.color.series1 },
  ip: { fontSize: 11, color: theme.color.textMuted, marginLeft: 'auto', ...theme.text.mono },
  error: { ...theme.text.body, color: theme.color.danger, paddingHorizontal: theme.space(4), paddingBottom: theme.space(2) },
  empty: { ...theme.text.body, color: theme.color.textMuted, textAlign: 'center', marginTop: theme.space(10) },
  spinner: { marginVertical: theme.space(6) },
});
