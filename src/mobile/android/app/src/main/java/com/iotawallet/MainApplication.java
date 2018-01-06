package com.iota.wallet;

import android.content.Context;
import android.support.multidex.MultiDex;

import com.airbnb.android.react.lottie.LottiePackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.horcrux.svg.SvgPackage;
import com.jadsonlourenco.RNShakeEvent.RNShakeEventPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.oblador.keychain.KeychainPackage;
import com.peel.react.rnos.RNOSModule;
import com.reactnativenavigation.NavigationApplication;
import com.rndetectnavbarandroid.RNDetectNavbarAndroidPackage;
import com.rnfs.RNFSPackage;
import com.rnprint.RNPrint.RNPrintPackage;

import java.util.Arrays;
import java.util.List;

import ca.jaysoo.extradimensions.ExtraDimensionsPackage;

public class MainApplication extends NavigationApplication {

  @Override
  protected void attachBaseContext(Context base) {
    super.attachBaseContext(base);
    MultiDex.install(this);
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
            new RandomBytesPackage(),
            new SvgPackage(),
            new MainReactPackage(),
            new RNDeviceInfo(),
            new RNShakeEventPackage(),
            new RNOSModule(),
            new RNHTMLtoPDFPackage(),
            new RNPrintPackage(),
	        new RCTCameraPackage(),
	        new RNFSPackage(),
            new ExtraDimensionsPackage(),
            new RNDetectNavbarAndroidPackage(),
            new KCKeepAwakePackage(),
            new KeychainPackage(),
            new LottiePackage()
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }
}
