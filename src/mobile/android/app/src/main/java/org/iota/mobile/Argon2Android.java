package org.iota.mobile;

import java.util.HashMap;
import java.util.Arrays;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableArray;

import de.wuthoehle.argon2jni.Argon2;
import de.wuthoehle.argon2jni.Argon2Result;
import de.wuthoehle.argon2jni.Argon2Exception;
import de.wuthoehle.argon2jni.SecurityParameters;

import static org.iota.mobile.Converter.readableArrayToByteArray;

public class Argon2Android extends ReactContextBaseJavaModule {
    public Argon2Android(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    /**
     * Initializes Argon2
     * @param options HashMap (t_cost, m_cost, parallelism, hashLength)
     * @return Argon2
     */
    public static Argon2 init(HashMap options) {
        SecurityParameters securityParams = new SecurityParameters();

        if (options.containsKey("t_cost")) {
            securityParams.t_cost = ((Double) options.get("t_cost")).intValue();
        }

        if (options.containsKey("m_cost")) {
            securityParams.m_cost = ((Double) options.get("m_cost")).intValue();
        }

        if (options.containsKey("parallelism")) {
            securityParams.parallelism = ((Double) options.get("parallelism")).intValue();
        }

        if (options.containsKey("hashLength")) {
            return new Argon2(securityParams, ((Double) options.get("hashLength")).intValue());
        }

        return new Argon2(securityParams);
    }

    @Override
    public String getName() {
        return "Argon2Android";
    }

    /**
     * Gets argon2 hash
     * @param password Password to hash
     * @param salt
     * @param options Supported options (t_cost, m_cost, parallelism, hashLength)
     * @param promise
     */
    @ReactMethod
    public void hash(ReadableArray password, String salt, ReadableMap options, Promise promise) {
        try {
            byte[] pwordByteArray = readableArrayToByteArray(password);
            Argon2 instance = Argon2Android.init(options.toHashMap());
            Argon2Result result = instance.argon2_hash_raw(pwordByteArray, salt.getBytes());

            byte[] input = result.getResult();

            // Convert to int array to match the logic on iOS side
            // https://github.com/cvarley100/CatCrypto/blob/master/Sources/Cryptos/Argon.swift#L146
            int[] intArray = new int[input.length];
            for (int i = 0; i < input.length; i++) {
                intArray[i] = input[i] & 0xff; // Range 0 to 255, not -128 to 127
            }

            promise.resolve(Arrays.toString(intArray).replaceAll("\\[|\\]",""));
        } catch(Argon2Exception error) {
            promise.reject(error);
        }
    }
}
