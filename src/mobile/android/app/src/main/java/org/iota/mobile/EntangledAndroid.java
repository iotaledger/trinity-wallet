package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.GuardedResultAsyncTask;
import com.facebook.react.bridge.ReactContext;

import static org.iota.mobile.Converter.readableArrayToByteArray;
import static org.iota.mobile.Converter.byteArrayToWritableArray;


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
    public void generateAddress(ReadableArray seed, int index, int security, Promise promise) {
        byte[] seedByteArr = readableArrayToByteArray(seed);
        byte[] addressByteArr = Interface.iota_sign_address_gen_trits(seedByteArr, index, security);
        WritableArray addressWritableArr = byteArrayToWritableArray(addressByteArr);
        promise.resolve(addressWritableArr);
    }

    @ReactMethod
    public void generateAddresses(final ReadableArray seed, final int index, final int security, final int total, final Promise promise) {
        byte[] seedByteArr = readableArrayToByteArray(seed);
        new GuardedResultAsyncTask<ReadableNativeArray>(mContext) {
            @Override
            protected ReadableNativeArray doInBackgroundGuarded() {
                WritableNativeArray addresses = new WritableNativeArray();
                int i = 0;
                int addressIndex = index;
                do {
                    byte[] address = Interface.iota_sign_address_gen_trits(seedByteArr, addressIndex, security);
                    addresses.pushArray(byteArrayToWritableArray(address));
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
    public void getDigest(String trytes, Promise promise) {
      String digest = Interface.iota_digest(trytes);
      promise.resolve(digest);
    }

    @ReactMethod
    public void generateSignature(ReadableArray seed, int index, int security, ReadableArray bundleHash, Promise promise) {
        byte[] seedByteArr = readableArrayToByteArray(seed);
        byte[] bundleHashByteArr = readableArrayToByteArray(bundleHash);
        byte[] signatureByteArr = Interface.iota_sign_signature_gen_trits(seedByteArr, index, security, bundleHashByteArr);
        WritableArray signatureWritableArr = byteArrayToWritableArray(signatureByteArr);
        promise.resolve(signatureWritableArr);
    }

    @ReactMethod
    public void trytesPow(final String trytes, final int mwm, final Promise promise) {
        new GuardedResultAsyncTask<String>(mContext) {
            @Override
            protected String doInBackgroundGuarded() {
                String nonce = Interface.iota_pow_trytes(trytes, mwm);
                return nonce;
            }

            @Override
            protected void onPostExecuteGuarded(String result) {
                promise.resolve(result);
            }
        }.execute();
    }

    @ReactMethod
    public void bundlePow(
        final ReadableArray trytes,
        final String trunk,
        final String branch,
        final int mwm,
        final Promise promise
    ) {
        new GuardedResultAsyncTask<String[]>(mContext) {
            @Override
            protected String[] doInBackgroundGuarded() {
                String[] trytesBeforePow = new String[trytes.size()];

                for (int i = 0; i < trytes.size(); i++) {
                    trytesBeforePow[i] = trytes.getString(i);
                }

                String[] attachedTrytes = Interface.iota_pow_bundle(trytesBeforePow, trunk, branch, mwm);
                                
                return attachedTrytes;
            }

            @Override
            protected void onPostExecuteGuarded(String[] result) {
                WritableNativeArray attachedTrytes = new WritableNativeArray();

                for (int i = 0; i < result.length; i++) {
                    attachedTrytes.pushString(result[i]);
                }

                promise.resolve(attachedTrytes);
            }
        }.execute();
    }
}
