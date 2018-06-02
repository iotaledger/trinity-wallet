#!/bin/bash

# copy source to working directory so we don't change working tree
mkdir /trinity
cp -r /source/* /trinity || exit 1
cd /trinity || exit 1

yarn full-setup
cd src/shared || exit 1
yarn
cd ../..

echo "Building desktop"
cd src/desktop
node_modules/.bin/electron-rebuild || exit 1
# mac not supported
yarn compile:windows || exit 1
yarn compile:linux || exit 1
cp -r dist/* /dist/desktop


echo "Building mobile"
cd ../../src/mobile
yarn || exit 1

cd android
./gradlew dependencies
