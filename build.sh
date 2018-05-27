#!/bin/bash

echo "Building desktop"
cd src/desktop
node_modules/.bin/electron-rebuild || exit 1
yarn compile || exit 1
cp -r dist/* /dist/desktop

echo "Building mobile"
cd ../../src/mobile
yarn install || exit 1
