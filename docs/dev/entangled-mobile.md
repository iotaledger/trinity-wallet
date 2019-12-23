# Building `entangled` for Trinity Mobile

## Required Dependencies
- [Bazel](https://docs.bazel.build/versions/master/install.html)
- Xcode with Command Line Tools installed (iOS only)
- Android SDK (Android only)
- Android NDK (Android only)


## iOS
1. Clone `iotaledger/entangled` and navigate to it
```
git clone https://github.com/iotaledger/entangled && cd entangled
```
2. Build the `mobile/ios:ios_bindings` target for all CPU architectures
```
bazel build --ios_multi_cpus=i386,x86_64,armv7,arm64 --copt=-fembed-bitcode --copt=-O3 //mobile/ios:ios_bindings
```
3. Unzip the generated framework
```
unzip bazel-bin/mobile/ios/ios_bindings.zip -d ios_bindings
```
5. Open the Trinity iOS workspace located in `trinity-wallet/src/mobile/ios/iotaWallet.xcworkspace`
6. Delete the existing `EntangledKit.framework` from the workspace (make sure to select `Move to Trash`)
7. Drag the new framework from `entangled/ios_bindings` into the `Frameworks` group in the workspace (ensure that `Copy items if needed` and `Create groups` are selected)

## Android

1. Navigate to `entangled`
2. Make sure you have Android SDK api level 19 installed
```
Android Studio -> Preferences -> Appearance & Behaviour -> System Settings -> Android SDK -> SDK Platforms
```
2. Make sure you have Android NDK installed
```
Android Studio -> Preferences -> Appearance & Behaviour -> System Settings -> Android SDK -> SDK Tools
```
3. Set the `ANDROID_HOME` and `ANDROID_NDK_HOME` environment variables (https://www.dev2qa.com/how-to-set-android-sdk-path-in-windows-and-mac/)
4. Build the `mobile/android:dummy` target for all CPU architectures
```
bazel build --fat_apk_cpu='armeabi-v7a,arm64-v8a,x86,x86_64' --copt=-O3 //mobile/android:dummy
```
5. Install apktool. Navigate to `bazel-bin/mobile/android` and run `apktool d` on dummy.apk.
6. Copy the build architecture folders to `trinity-wallet/src/mobile/android/app/src/main/jniLibs/`
