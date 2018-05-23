package com.iota.trinity;

import com.reactnativenavigation.controllers.SplashActivity;
import android.os.Bundle;
import io.fabric.sdk.android.Fabric;
import com.crashlytics.android.Crashlytics;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.widget.ImageView;
import android.view.Gravity;
import android.view.View;
import android.support.v4.content.ContextCompat;

public class MainActivity extends SplashActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Fabric.with(this, new Crashlytics());
        long size = 50L * 1024L * 1024L; // 50 MB
        com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
    }

    @Override
    public View createSplashLayout() {
        LinearLayout view = new LinearLayout(this);
        ImageView imageView = new ImageView(this);

        view.setBackgroundColor(Color.parseColor("#181818"));
        view.setGravity(Gravity.CENTER);

        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(400, 400);
        layoutParams.gravity = Gravity.CENTER;
        imageView.setLayoutParams(layoutParams);
        imageView.setImageDrawable(ContextCompat.getDrawable(this.getApplicationContext(), R.drawable.background_splash));

        view.addView(imageView);
        return new View(this);
    }
}
