package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.ReadableNativeArray;

import com.facebook.react.bridge.GuardedResultAsyncTask;
import com.facebook.react.bridge.ReactContext;

public class EntangledAndroid extends ReactContextBaseJavaModule {
    private final ReactContext mContext;

    public EntangledAndroid(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return "EntangledAndroid";
    }

    @ReactMethod
    public void generateAddress(String seed, int index, int security, Promise promise) {
      String address = Interface.generateAddress(seed, index, security);
      promise.resolve(address);
    }

    @ReactMethod
    public void generateAddresses(final String seed, final int index, final int security, final int total, final Promise promise) {
        new GuardedResultAsyncTask<ReadableNativeArray>(mContext) {
            @Override
            protected ReadableNativeArray doInBackgroundGuarded() {
                WritableNativeArray addresses = new WritableNativeArray();
                int i = 0;
                int addressIndex = index;

                do {
                    String address = Interface.generateAddress(seed, addressIndex, security);
                    addresses.pushString(address);
                    i++;
                    addressIndex++;
                } while (i < total);

                return addresses;
            }

            @Override
            protected void onPostExecuteGuarded(ReadableNativeArray result) {
                promise.resolve(result);
            }

        }.execute();
    }


    @ReactMethod
    public void generateSignature(String trytes, int index, int security, String bundleHash, Promise promise) {
      String signature = Interface.generateSignature(trytes, index, security, bundleHash);
      promise.resolve(signature);
    }

    @ReactMethod
    public void doPoW(final String trytes, final int mwm, final Promise promise) {
        new GuardedResultAsyncTask<String>(mContext) {
            @Override
            protected String doInBackgroundGuarded() {
                String nonce = Interface.doPOW(trytes, mwm);
                return nonce;
            }

            @Override
            protected void onPostExecuteGuarded(String result) {
                promise.resolve(result);
            }

        }.execute();
    }
}
