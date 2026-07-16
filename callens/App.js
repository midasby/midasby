import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Onboarding from './src/screens/Onboarding';
import Paywall from './src/screens/Paywall';
import Home from './src/screens/Home';
import History from './src/screens/History';
import AddMeal from './src/screens/AddMeal';
import Settings from './src/screens/Settings';

import { loadProfile, saveProfile, loadMeals, saveMeals, getAiCount, bumpAiCount, clearAll } from './src/storage';
import { dailyTarget, todayKey } from './src/calc';
import { aiAvailable } from './src/ai';
import { initPurchases, checkPremium, purchase } from './src/purchases';
import { t } from './src/i18n';
import { colors } from './src/theme';
import { Alert } from 'react-native';

const FREE_DAILY_AI = 3; // ücretsiz planda günlük fotoğraf analizi hakkı

export default function App() {
  const [screen, setScreen] = useState('loading'); // loading | onboarding | paywall | main
  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [tab, setTab] = useState('home');
  const [addVisible, setAddVisible] = useState(false);
  const [addMode, setAddMode] = useState('photo');
  const [aiCount, setAiCount] = useState(0);

  useEffect(() => {
    (async () => {
      await initPurchases();
      const p = await loadProfile();
      if (p && p.onboarded) {
        // Mağazadan gerçek abonelik durumunu doğrula (yeniden kurulum/cihaz değişimi)
        const storePremium = await checkPremium();
        const next = storePremium === null ? p : { ...p, premium: storePremium };
        if (storePremium !== null && storePremium !== p.premium) saveProfile(next);
        setProfile(next);
        setMeals(await loadMeals(todayKey()));
        setAiCount(await getAiCount(todayKey()));
        setScreen('main');
      } else {
        setScreen('onboarding');
      }
    })();
  }, []);

  const persistMeals = useCallback((next) => {
    setMeals(next);
    saveMeals(todayKey(), next);
  }, []);

  const handleOnboardingComplete = (p) => {
    const full = { ...p, dailyTarget: dailyTarget(p), premium: false, onboarded: true };
    setProfile(full);
    saveProfile(full);
    setScreen('paywall');
  };

  // RevenueCat satın alma; native modül yoksa (Expo Go/web) simüle edilir.
  const handleSubscribe = async (plan) => {
    const ok = await purchase(plan);
    if (!ok) {
      Alert.alert('', t('purchaseFail'));
      return;
    }
    const next = { ...profile, premium: true };
    setProfile(next);
    saveProfile(next);
    setScreen('main');
  };

  const handleSkipPaywall = () => setScreen('main');

  const canUseAi = () => profile?.premium || aiCount < FREE_DAILY_AI;

  const handleSaveMeal = async (meal) => {
    persistMeals([...meals, meal]);
    setAddVisible(false);
    if (meal.usedAi && !profile.premium) {
      setAiCount(await bumpAiCount(todayKey()));
    }
  };

  const handleDeleteMeal = (id) => persistMeals(meals.filter((m) => m.id !== id));

  const handleUpdateProfile = (next) => {
    setProfile(next);
    saveProfile(next);
  };

  const handleReset = async () => {
    await clearAll();
    setProfile(null);
    setMeals([]);
    setAiCount(0);
    setTab('home');
    setScreen('onboarding');
  };

  const openAdd = (mode) => {
    setAddMode(mode);
    setAddVisible(true);
  };

  if (screen === 'loading') {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.logo}>
          Cal<Text style={{ color: colors.primary }}>Lens</Text>
        </Text>
      </View>
    );
  }

  if (screen === 'onboarding') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <Onboarding onComplete={handleOnboardingComplete} />
      </SafeAreaView>
    );
  }

  if (screen === 'paywall') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <Paywall onSubscribe={handleSubscribe} onSkip={handleSkipPaywall} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {tab === 'home' && (
          <Home
            profile={profile}
            meals={meals}
            onSnap={() => openAdd('photo')}
            onManual={() => openAdd('manual')}
            onDeleteMeal={handleDeleteMeal}
          />
        )}
        {tab === 'history' && <History profile={profile} todayMeals={meals} />}
        {tab === 'settings' && (
          <Settings
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onReset={handleReset}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {[
          ['home', '🏠'],
          ['history', '📊'],
          ['settings', '⚙️'],
        ].map(([key, icon]) => (
          <TouchableOpacity key={key} style={styles.tabItem} onPress={() => setTab(key)} activeOpacity={0.7}>
            <Text style={[styles.tabIcon, tab !== key && styles.tabInactive]}>{icon}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <AddMeal
        visible={addVisible}
        mode={addMode}
        onClose={() => setAddVisible(false)}
        onSave={handleSaveMeal}
        canUseAi={canUseAi}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: colors.text },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingBottom: 18,
    paddingTop: 10,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabInactive: { opacity: 0.35 },
});
