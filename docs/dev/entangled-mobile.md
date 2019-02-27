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
2. Check out [iotaledger/entangled#26](https://github.com/iotaledger/entangled/pull/26)
```
git fetch origin pull/26/head:ios
```
3. Build the `mobile/ios:ios_bindings` target for all CPU architectures
```
bazel build --ios_multi_cpus=i386,x86_64,armv7,arm64 --copt=-fembed-bitcode --copt=-O3 //mobile/ios:ios_bindings
```
4. Unzip the generated framework
```
unzip bazel-bin/mobile/ios/ios_bindings.zip -d ios_bindings
```
5. Open the Trinity iOS workspace located in `trinity-wallet/src/mobile/ios/iotaWallet.xcworkspace`
6. Delete the existing `EntangledKit.framework` from the workspace (make sure to select `Move to Trash`)
7. Drag the new framework from `entangled/ios_bindings` into the `Frameworks` group in the workspace (ensure that `Copy items if needed` and `Create groups` are selected)

## Android

1. Clone `iotaledger/entangled` and navigate to it
```
git clone https://github.com/iotaledger/entangled && cd entangled
```
2. Build the `mobile/android:dummy` target for all CPU architectures
```
bazel build --fat_apk_cpu='armeabi-v7a,arm64-v8a,x86,x86_64' --copt=-Ofast  //mobile/android:dummy
```
3. Unzip the generated APK
```
unzip bazel-bin/mobile/android/dummy.apk -d dummy
```
4. Copy the `libdummy.so` from each architecture's folder in `dummy` (e.g. `arm64-v8a` will be in `entangled/dummy/lib/arm64-v8a`) into its respective folder in the Trinity Android project (e.g. `arm64-v8a` will be in `trinity-wallet/src/mobile/android/app/src/main/jniLibs/arm64-v8a`)
