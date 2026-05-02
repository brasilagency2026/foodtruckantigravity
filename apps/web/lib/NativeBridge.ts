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
  scheduleNotification: async (title: string, body: string, soundName: string = 'alert.wav', id: number = 1) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
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
