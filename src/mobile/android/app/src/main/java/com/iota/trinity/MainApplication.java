package com.iota.trinity;

import android.content.Context;
import com.bitgo.randombytes.RandomBytesPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.keychain.KeychainPackage;
import com.peel.react.rnos.RNOSModule;
import com.christopherdro.RNPrint.RNPrintPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import net.rhogan.rnsecurerandom.RNSecureRandomPackage;
import org.iota.mobile.IOTAMobilePackage;
import cl.json.ShareApplication;
import module.share.ShareSecurePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import my.fin.RNIsDeviceRootedPackage;
import com.bugsnag.BugsnagReactNative;
import com.rajivshah.safetynet.RNGoogleSafetyNetPackage;
import com.hieuvp.fingerprint.ReactNativeFingerprintScannerPackage;
import com.rndetectnavbarandroid.RNDetectNavbarAndroidPackage;
import cl.json.RNSharePackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.kristiansorens.flagsecure.FlagSecurePackage;
import com.mkuczera.RNReactNativeHapticFeedbackPackage;
import io.realm.react.RealmReactPackage;
import me.listenzz.modal.TranslucentModalReactPackage;
import ca.jaysoo.extradimensions.ExtraDimensionsPackage;
import com.janeasystems.rn_nodejs_mobile.RNNodeJsMobilePackage;
import io.github.elyx0.reactnativedocumentpicker.DocumentPickerPackage;
import com.lewin.qrcode.QRScanReaderPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;
import com.facebook.react.ReactNativeHost;
import com.zapper.QRCodePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;

import java.util.Arrays;
import java.util.List;


public class MainApplication extends NavigationApplication implements ShareApplication {

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);

        System.loadLibrary("dummy");
    }

    @Override
    public boolean isDebug() {
        // Make sure you are using BuildConfig from your own application
        return BuildConfig.DEBUG;
    }

    protected List<ReactPackage> getPackages() {
        // Add additional packages you require here
        // No need to add RnnPackage and MainReactPackage
        return Arrays.<ReactPackage>asList(
                // eg. new VectorIconsPackage()
                new TranslucentModalReactPackage(),
                new SvgPackage(),
                new MainReactPackage(),
                new QRCodePackage(),
                new RNCameraPackage(),
                new QRScanReaderPackage(),
                new DocumentPickerPackage(),
                new RNNodeJsMobilePackage(),
                new FlagSecurePackage(),
                new RNDetectNavbarAndroidPackage(),
                new RNDeviceInfo(),
                new RNOSModule(),
                new RNPrintPackage(),
                new ExtraDimensionsPackage(),
                new KCKeepAwakePackage(),
                new KeychainPackage(),
                new LottiePackage(),
                new IOTAMobilePackage(),
                new RNExitAppPackage(),
                new RNSecureRandomPackage(),
                new RandomBytesPackage(),
                new VectorIconsPackage(),
                new RNIsDeviceRootedPackage(),
                BugsnagReactNative.getPackage(),
                new RNGoogleSafetyNetPackage(),
                new ReactNativeFingerprintScannerPackage(),
                new ShareSecurePackage(),
                new RNReactNativeHapticFeedbackPackage(),
                new RNSharePackage(),
                new RNViewShotPackage(),
                new RealmReactPackage(),
                new RNFetchBlobPackage(),
                new RNCWebViewPackage()
        );
    }

    @Override
    public List<ReactPackage> createAdditionalReactPackages() {
        return getPackages();
    }

    @Override
    public String getFileProviderAuthority() {
        return "com.iota.trinity.provider";
    }

    @Override
    protected ReactGateway createReactGateway() {
        ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
            @Override
            protected String getJSMainModuleName() {
                return "index";
            }
        };
        return new ReactGateway(this, isDebug(), host);
    }
}
