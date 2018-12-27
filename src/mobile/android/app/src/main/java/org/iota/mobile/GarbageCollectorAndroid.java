package org.iota.mobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.JavaScriptContextHolder;

public class GarbageCollectorAndroid extends ReactContextBaseJavaModule {
    private final ReactContext mContext;
    public GarbageCollectorAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "GarbageCollectorAndroid";
    }

    @ReactMethod
    public void forceGC() {
        JavaScriptContextHolder jsContext = mContext.getJavaScriptContextHolder();
        synchronized(jsContext) {
            GarbageCollectorInterface.runGC(jsContext.get());
        }
    }
}
