#!/usr/bin/env bash

# Fail if any commands fail
set -e

# Install shared dependencies
echo ":yarn: Install shared dependencies"
yarn
cd src/shared && yarn && cd ../..

# Install mobile dependencies
echo ":yarn: Install mobile dependencies"
cd src/mobile && yarn && cd ../..

# Dependency audit
echo ":mag: Audit shared and mobile dependencies"
cd src/shared && yarn audit && cd ../mobile && yarn audit && cd ../..

# ESLint
echo ":eslint: Run ESLint for shared and mobile"
yarn lint:shared && yarn lint:mobile

# Jest
echo ":jest: Run mobile tests"
cd src/mobile && yarn test && cd ../..

# Bundle
echo ":react: Bundle"
cd src/mobile && react-native bundle --entry-file index.android.js --platform android --bundle-output android/main.jsbundle --dev true
