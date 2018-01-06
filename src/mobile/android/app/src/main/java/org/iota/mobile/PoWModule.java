package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class PoWModule extends ReactContextBaseJavaModule {
    public PoWModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PoWModule";
    }

    @ReactMethod
    public void doPoW(String trytes, int mwm, Promise promise) {
      String nonce = Interface.doPOW(trytes, mwm);
      promise.resolve(nonce);
    }
}
