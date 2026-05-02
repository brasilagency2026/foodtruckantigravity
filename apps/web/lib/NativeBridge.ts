import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * NativeBridge handles communication with native mobile features (Android/iOS).
 * It safely falls back to web alternatives if not running in a native app.
 */
export const NativeBridge = {
  /**
   * Triggers a vibration effect
   */
  vibrate: async (style: 'heavy' | 'medium' | 'light' = 'medium') => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const impactStyle = 
        style === 'heavy' ? ImpactStyle.Heavy : 
        style === 'light' ? ImpactStyle.Light : 
        ImpactStyle.Medium;
        
      await Haptics.impact({ style: impactStyle });
    } catch (e) {
      console.error('Vibration failed', e);
    }
  },

  /**
   * Triggers a strong vibration (useful for urgent alerts)
   */
  vibrateNotification: async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // Vibrate for 1 second (Android only supports duration)
      await Haptics.vibrate({ duration: 1000 });
    } catch (e) {
      console.error('Strong vibration failed', e);
    }
  },

  /**
   * Request all necessary permissions for haptics and notifications
   */
  requestPermissions: async () => {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch (e) {
      console.error('Permission request failed', e);
      return false;
    }
  },

  /**
   * Schedule a local notification (Android/iOS)
   */
  scheduleNotification: async (title: string, body: string, soundName: string = 'alert', id: number = 1) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // For Android 8.0+, we MUST create a channel with the custom sound
      await LocalNotifications.createChannel({
        id: soundName, // We use the sound name as channel ID for simplicity
        name: soundName === 'kitchen_alert' ? 'Alertas de Cozinha' : 'Alertas de Retirada',
        description: 'Canal para notificações com som personalizado',
        importance: 5, // Max importance
        visibility: 1,
        sound: soundName,
        vibration: true,
      });

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            channelId: soundName,
            schedule: { at: new Date(Date.now() + 100) },
            sound: soundName,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.error('Local notification failed', e);
    }
  }
};
