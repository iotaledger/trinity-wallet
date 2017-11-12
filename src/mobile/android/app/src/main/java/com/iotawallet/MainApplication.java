package com.iotawallet;

import android.app.Application;

import com.rnprint.RNPrint.RNPrintPackage;
import com.facebook.react.ReactApplication;
import com.jadsonlourenco.RNShakeEvent.RNShakeEventPackage;
import com.peel.react.rnos.RNOSModule;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;
import com.tradle.react.UdpSocketsModule;
import com.peel.react.TcpSocketsModule;
import com.horcrux.svg.SvgPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.reactnativenavigation.bridge.NavigationReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.reactnativenavigation.NavigationApplication;
import com.horcrux.svg.SvgPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.rnfs.RNFSPackage;
import java.util.Arrays;
import java.util.List;
import com.slowpath.hockeyapp.RNHockeyAppModule;
import com.slowpath.hockeyapp.RNHockeyAppPackage;

public class MainApplication extends NavigationApplication {

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
	new RNHockeyAppPackage(MainApplication.this),
            new RandomBytesPackage(),
            new SvgPackage(),
            new MainReactPackage(),
            new RNShakeEventPackage(),
            new RNOSModule(),
            new RNHTMLtoPDFPackage(),
            new RNPrintPackage(),
            new RNSensitiveInfoPackage(),
	        new RCTCameraPackage(),
	        new RNFSPackage()
    );
  }

  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    return getPackages();
  }
}
