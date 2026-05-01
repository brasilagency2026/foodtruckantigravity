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
   * Triggers a notification vibration pattern (success, warning, error)
   */
  vibrateNotification: async (type: 'success' | 'warning' | 'error') => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const hapticType = 
        type === 'success' ? NotificationType.Success :
        type === 'warning' ? NotificationType.Warning :
        NotificationType.Error;
        
      await Haptics.notification({ type: hapticType });
    } catch (e) {
      console.error('Haptic notification failed', e);
    }
  },

  /**
   * Schedule a local notification (Android/iOS)
   */
  scheduleNotification: async (title: string, body: string, id: number = 1) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      // Check permissions first
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id,
            schedule: { at: new Date(Date.now() + 100) }, // almost instant
            sound: 'alert.wav', // You can add custom sounds to android/app/src/main/res/raw
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
