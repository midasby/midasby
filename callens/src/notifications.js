// Günlük hatırlatma bildirimi (yerel, sunucu gerekmez): 20:30'da
// "bugünü kaydetmedin" hatırlatması. Web'de desteklenmez; hatalar akışı bozmaz.

import { Platform } from 'react-native';
import { t } from './i18n';

let Notifications = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line global-require
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (e) {
    Notifications = null;
  }
}

export const notificationsSupported = !!Notifications;

const REMINDER_HOUR = 20;
const REMINDER_MINUTE = 30;

// true dönerse hatırlatma kuruldu; false = izin verilmedi/desteklenmiyor.
export async function enableReminder() {
  if (!Notifications) return false;
  try {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('notifPushTitle'),
        body: t('notifPushBody'),
      },
      trigger: { type: 'daily', hour: REMINDER_HOUR, minute: REMINDER_MINUTE },
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function disableReminder() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // no-op
  }
}
