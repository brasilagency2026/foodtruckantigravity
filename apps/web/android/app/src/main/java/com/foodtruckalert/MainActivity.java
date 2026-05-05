package com.foodtruckalert;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private String pendingDeepLink = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleDeepLink(intent);
    }

    private void handleDeepLink(Intent intent) {
        if (intent == null || intent.getData() == null) return;

        Uri data = intent.getData();
        String scheme = data.getScheme();

        if ("foodtruckalert".equals(scheme)) {
            // Extract path: foodtruckalert://menu/{truckId} → /t/{truckId}
            String host = data.getHost(); // "menu"
            String path = data.getPath(); // "/{truckId}"

            if ("menu".equals(host) && path != null && path.length() > 1) {
                String truckId = path.substring(1); // Remove leading "/"
                String webUrl = "https://www.foodpronto.com.br/t/" + truckId;

                // Navigate the WebView to the truck menu
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().loadUrl(webUrl);
                } else {
                    // Bridge not ready yet, save for later
                    pendingDeepLink = webUrl;
                }
            }
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // If we have a pending deep link and the bridge is now ready
        if (pendingDeepLink != null && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().loadUrl(pendingDeepLink);
            pendingDeepLink = null;
        }
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
