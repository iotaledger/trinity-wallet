package com.iota.wallet;

import com.horcrux.svg.SvgPackage;
import com.reactnativenavigation.controllers.SplashActivity;
import android.os.Bundle;
import io.fabric.sdk.android.Fabric;
import com.crashlytics.android.Crashlytics;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.widget.TextView;
import android.view.Gravity;
import android.util.TypedValue;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

public class MainActivity extends SplashActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Fabric.with(this, new Crashlytics());
        long size = 50L * 1024L * 1024L; // 50 MB
        com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
    }
    @Override
    public LinearLayout createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        view.setBackgroundColor(Color.parseColor("#1a373e"));
        view.setGravity(Gravity.CENTER);
        return view;
    }
}
