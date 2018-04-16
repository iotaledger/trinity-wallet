package com.iota.wallet;

import org.devio.rn.splashscreen.SplashScreen;
import android.os.Bundle;
import io.fabric.sdk.android.Fabric;
import com.crashlytics.android.Crashlytics;
import com.facebook.react.ReactActivity;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        super.onCreate(savedInstanceState);
        Fabric.with(this, new Crashlytics());
        long size = 50L * 1024L * 1024L; // 50 MB
        com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
    }
}
