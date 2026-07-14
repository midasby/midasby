import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { tradePnl, formatMoney } from '../stats';
import { colors, spacing, radius } from '../theme';

function TradeRow({ trade, currency, onDelete }) {
  const pnl = tradePnl(trade);
  const isWin = pnl >= 0;
  const d = new Date(trade.date);
  const dateText = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onLongPress={() =>
        Alert.alert('İşlemi sil', `${trade.symbol} işlemini silmek istiyor musun?`, [
          { text: 'Vazgeç', style: 'cancel' },
          { text: 'Sil', style: 'destructive', onPress: () => onDelete(trade.id) },
        ])
      }
    >
      <View style={styles.rowLeft}>
        <View style={styles.symbolLine}>
          <Text style={styles.symbol}>{trade.symbol}</Text>
          <View style={[styles.dirBadge, { backgroundColor: trade.direction === 'LONG' ? '#123524' : '#3A1A1A' }]}>
            <Text style={{ color: trade.direction === 'LONG' ? colors.green : colors.red, fontSize: 11, fontWeight: '700' }}>
              {trade.direction}
            </Text>
          </View>
          {trade.emotion ? <Text style={styles.emotion}>{trade.emotion}</Text> : null}
        </View>
        <Text style={styles.meta}>
          {dateText}
          {trade.strategy ? ` · ${trade.strategy}` : ''}
        </Text>
        {trade.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {trade.note}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.pnl, { color: isWin ? colors.green : colors.red }]}>{formatMoney(pnl, currency)}</Text>
    </TouchableOpacity>
  );
}

export default function TradesScreen({ trades, settings, onDelete, onAddPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İşlemler</Text>
        <Text style={styles.count}>{trades.length} kayıt</Text>
      </View>
      {trades.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📒</Text>
          <Text style={styles.emptyText}>
            Günlüğün boş.{'\n'}Sağ alttaki + ile ilk işlemini kaydet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trades}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <TradeRow trade={item} currency={settings.currency} onDelete={onDelete} />}
          contentContainerStyle={{ padding: spacing.m, paddingBottom: 120 }}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={onAddPress} activeOpacity={0.85}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: spacing.m,
    paddingBottom: spacing.s,
  },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  count: { color: colors.textDim, fontSize: 13, marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  rowLeft: { flex: 1, marginRight: spacing.s },
  symbolLine: { flexDirection: 'row', alignItems: 'center' },
  symbol: { color: colors.text, fontSize: 16, fontWeight: '700', marginRight: 8 },
  dirBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  emotion: { fontSize: 14, marginLeft: 8 },
  meta: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  note: { color: colors.textDim, fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  pnl: { fontSize: 16, fontWeight: '800' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 44, marginBottom: 10 },
  emptyText: { color: colors.textDim, textAlign: 'center', lineHeight: 22 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 96,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 28, color: '#141414', fontWeight: '700', marginTop: -2 },
});
