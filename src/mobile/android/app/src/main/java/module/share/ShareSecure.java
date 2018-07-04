package module.share;

import android.content.Context;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Parcelable;
import android.support.annotation.Nullable;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.Callback;
import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Array;
import java.sql.SQLOutput;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ShareSecure extends ReactContextBaseJavaModule {

    protected final ReactApplicationContext reactContext;
    static final String ERROR_INTENT_NOT_AVAILABLE = "E_INTENT_NOT_AVAILABLE";
    static final String ACTION_SHARED = "sharedAction";

    public ShareSecure(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ShareSecure";
    }

    @ReactMethod
    public void share (String type, ReadableMap content, Promise promise) {
        initShareIntent(type, content, promise);
    }


    private void initShareIntent(String type, ReadableMap content, Promise promise) {
        List<Intent> limitedShareIntents = new ArrayList<Intent>();
        Intent shareIntent = new Intent(android.content.Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        PackageManager pm = this.reactContext.getPackageManager();
        // Gets the list of available intent activities
        List<ResolveInfo> resInfo = pm.queryIntentActivities(shareIntent, 0);

        for (ResolveInfo info : resInfo) {
            String packageName = info.activityInfo.packageName;
            Intent targetShareIntent = new Intent(android.content.Intent.ACTION_SEND);
            targetShareIntent.setType("text/plain");

            if (packageName.toLowerCase().contains(type) || info.activityInfo.name.toLowerCase().contains(type)) {
                if (content.hasKey("message")) {
                    targetShareIntent.putExtra(Intent.EXTRA_TEXT, content.getString("message"));
                }
                if (content.hasKey("title")) {
                    targetShareIntent.putExtra(Intent.EXTRA_SUBJECT, content.getString("title"));
                }
                    targetShareIntent.setPackage(info.activityInfo.packageName);
                    limitedShareIntents.add(targetShareIntent);
                }
        }
        if (limitedShareIntents.size() == 0){
            promise.reject(ERROR_INTENT_NOT_AVAILABLE, "Target intent not available.");
        } else {
            Intent chooser = Intent.createChooser(limitedShareIntents.remove(0), content.getString("title"));
            chooser.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            chooser.putExtra(Intent.EXTRA_INITIAL_INTENTS, limitedShareIntents.toArray(new Parcelable[limitedShareIntents.size()]));
            this.reactContext.startActivity(chooser);
        }
    }
}
