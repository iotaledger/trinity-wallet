package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.ReadableArray;

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
    public void generateAddresses(String seed, int index, int security, int total, Promise promise) {
        WritableNativeArray addresses = new WritableNativeArray();
        int i = 0;

        do {
            String address = Interface.generateAddress(seed, index, security);
            addresses.pushString(address);
            i++;
            index++;
        } while (i < total);

        promise.resolve(addresses);
    }

    @ReactMethod
    public void doPoW(final ReadableArray trytes, final String trunkTransaction, final String branchTransaction, final int mwm, final Promise promise) {
        new GuardedResultAsyncTask<ReadableNativeMap>(mContext) {
            @Override
            protected ReadableNativeMap doInBackgroundGuarded() {
                int i = 0;
                WritableNativeArray hashes = new WritableNativeArray();
                WritableNativeArray finalTrytes = new WritableNativeArray();

                int sizeOfTrytes = trytes.size();

                while (i < sizeOfTrytes) {
                    String trunk = i == 0 ? trunkTransaction : hashes.getString(i - 1);
                    String branch = i == 0 ? branchTransaction : trunkTransaction;
                    String thisTrytes = trytes.getString(i);

                    String updatedTrytes = thisTrytes.substring(0, 2430)
                                                     .concat(trunk)
                                                     .concat(branch)
                                                     .concat(thisTrytes.substring(2430 + trunk.length() + branch.length()));

                    String nonce = Interface.doPOW(updatedTrytes, mwm);

                    String updatedTrytesWithCorrectNonce = updatedTrytes.substring(0, 2673 - nonce.length()).concat(nonce);

                    String digest = Interface.getDigest(updatedTrytesWithCorrectNonce);

                    hashes.pushString(digest);
                    finalTrytes.pushString(updatedTrytesWithCorrectNonce);

                    ++i;
                }

                WritableNativeMap output = new WritableNativeMap();

                output.putArray("trytes", finalTrytes);
                output.putArray("hashes", hashes);

                return output;
            }

            @Override
            protected void onPostExecuteGuarded(ReadableNativeMap result) {
                promise.resolve(result);
            }

        }.execute();
    }
}
