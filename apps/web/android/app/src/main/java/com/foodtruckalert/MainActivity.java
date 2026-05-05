package com.foodtruckalert;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            // Delete old channels that are no longer needed
            manager.deleteNotificationChannel("default");
            manager.deleteNotificationChannel("kitchen_alert");

            // Create the NEW channel with custom sound
            NotificationChannel channel = new NotificationChannel(
                "pedidos_alert",
                "Alertas de Pedidos",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alertas importantes sobre seus pedidos");
            channel.enableVibration(true);
            channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);

            Uri sound = Uri.parse("android.resource://" + getPackageName() + "/raw/client_ready");
            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
            channel.setSound(sound, audioAttributes);

            manager.createNotificationChannel(channel);
        }
    }
}
