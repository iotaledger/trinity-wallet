package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;

import android.os.SystemClock;

public class NativeUtilsAndroid extends ReactContextBaseJavaModule {
  private final ReactContext mContext;

  public NativeUtilsAndroid(ReactApplicationContext reactContext) {
    super(reactContext);
    mContext = reactContext;
  }

  @Override
  public String getName() {
    return "NativeUtilsAndroid";
  }

  @ReactMethod
  public void getSystemUptime(Promise promise) {
    long time = SystemClock.elapsedRealtime();
    String timeAsString = Long.toString(time);

    promise.resolve(timeAsString);
  }
}
