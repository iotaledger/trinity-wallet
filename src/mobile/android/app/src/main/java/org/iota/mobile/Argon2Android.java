package org.iota.mobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableNativeMap;

import de.wuthoehle.argon2jni.Argon2;
import de.wuthoehle.argon2jni.EncodedArgon2Result;
import de.wuthoehle.argon2jni.Argon2Exception;

public class Argon2Android extends ReactContextBaseJavaModule {
    public Argon2Android(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Argon2Android";
    }

    @ReactMethod
    public void getHash(String pwd, String salt, Promise promise) {
        try {
            Argon2 instance = new Argon2();
            EncodedArgon2Result hash = instance.argon2_hash(pwd.getBytes(), salt.getBytes());

            promise.resolve(hash.getEncoded());
        } catch(Argon2Exception error) {
            promise.reject(error);
        }
    }
}
