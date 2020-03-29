package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import android.os.SystemClock;

public class NativeUtilsAndroid extends ReactContextBaseJavaModule {
  private final ReactContext mContext;

  public NativeUtilsAndroid(ReactApplicationContext reactContext) {
    super(reactContext);
    mContext = reactContext;
  }

  @Override
  String getName() {
    return "NativeUtilsAndroid";
  }

  @ReactMethod
  public void getSystemUptime(Promise promise) {
    promise.resolve(SystemClock.elapsedRealtime());
  }
}
