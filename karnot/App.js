import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';

import DashboardScreen from './src/screens/DashboardScreen';
import TradesScreen from './src/screens/TradesScreen';
import CalculatorScreen from './src/screens/CalculatorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddTradeModal from './src/screens/AddTradeModal';

import { loadTrades, saveTrades, loadSettings, saveSettings, clearAll, defaultSettings } from './src/storage';
import { monthTradeCount } from './src/stats';
import { FREE_MONTHLY_LIMIT } from './src/constants';
import { colors } from './src/theme';

const TABS = [
  { key: 'dashboard', label: 'Panel', icon: '📊' },
  { key: 'trades', label: 'İşlemler', icon: '📒' },
  { key: 'calc', label: 'Risk', icon: '🛡️' },
  { key: 'settings', label: 'Ayarlar', icon: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [addVisible, setAddVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, s] = await Promise.all([loadTrades(), loadSettings()]);
      setTrades(t);
      setSettings(s);
      setReady(true);
    })();
  }, []);

  const persistTrades = useCallback((next) => {
    setTrades(next);
    saveTrades(next);
  }, []);

  const handleAddPress = () => {
    if (!settings.premium && monthTradeCount(trades) >= FREE_MONTHLY_LIMIT) {
      Alert.alert(
        'Aylık sınıra ulaştın',
        `Ücretsiz planda ayda ${FREE_MONTHLY_LIMIT} işlem kaydedebilirsin. Sınırsız kayıt için Premium'a geç (Ayarlar sekmesi).`
      );
      return;
    }
    setAddVisible(true);
  };

  const handleSaveTrade = (trade) => {
    persistTrades([trade, ...trades]);
    setAddVisible(false);
    setTab('trades');
  };

  const handleDeleteTrade = (id) => {
    persistTrades(trades.filter((t) => t.id !== id));
  };

  const handleUpdateSettings = (next) => {
    setSettings(next);
    saveSettings(next);
  };

  const handleClearAll = async () => {
    await clearAll();
    setTrades([]);
    setSettings({ ...defaultSettings });
  };

  if (!ready) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.logo}>Kâr<Text style={{ color: colors.gold }}>Not</Text></Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {tab === 'dashboard' && <DashboardScreen trades={trades} settings={settings} />}
        {tab === 'trades' && (
          <TradesScreen
            trades={trades}
            settings={settings}
            onDelete={handleDeleteTrade}
            onAddPress={handleAddPress}
          />
        )}
        {tab === 'calc' && <CalculatorScreen settings={settings} />}
        {tab === 'settings' && (
          <SettingsScreen
            trades={trades}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onClearAll={handleClearAll}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, tab !== t.key && { opacity: 0.45 }]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && { color: colors.gold }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <AddTradeModal visible={addVisible} onClose={() => setAddVisible(false)} onSave={handleSaveTrade} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: { color: colors.text, fontSize: 34, fontWeight: '800' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingBottom: 18,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: colors.textDim, fontSize: 11, marginTop: 2, fontWeight: '600' },
});
