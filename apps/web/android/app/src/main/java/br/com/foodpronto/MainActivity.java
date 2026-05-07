package br.com.foodpronto;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private String pendingDeepLink = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
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
            String host = data.getHost();
            String path = data.getPath();

            if ("menu".equals(host) && path != null && path.length() > 1) {
                String truckId = path.substring(1);
                String webUrl = "https://www.foodpronto.com.br/t/" + truckId;

                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().loadUrl(webUrl);
                } else {
                    pendingDeepLink = webUrl;
                }
            }
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (pendingDeepLink != null && getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().loadUrl(pendingDeepLink);
            pendingDeepLink = null;
        }
    }
}
