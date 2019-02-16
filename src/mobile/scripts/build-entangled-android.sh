#!/bin/bash

out=bazel-bin/mobile/android
url=https://github.com/iotaledger/entangled
branch=develop

for i in '$@' ; do
    if [[ $i == '--clean' ]] ; then
        bazel clean
    fi
done

if [ -d entangled ]; then  
    cd entangled
  
    git fetch origin $branch && git checkout $branch && git submodule update --recursive
else
    git clone $url && cd entangled && git checkout $branch && git submodule update --init --recursive
fi

if [ $? -eq '0' ]; then
    bazel build --fat_apk_cpu='armeabi-v7a,arm64-v8a,x86,x86_64' --copt=-Ofast //mobile/android:dummy

    echo A | unzip $out/dummy.apk -d $out/dummy && cp -r $out/dummy/lib/ ../../android/app/src/main/jniLibs
fi
