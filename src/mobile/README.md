# IOTA Trinity Mobile Wallet

Testing: [![Build Status](https://badge.buildkite.com/c780f148417af9e785db5143d4d46dde1e57408a07f212aff3.svg?branch=develop)](https://buildkite.com/iota-foundation/trinity-mobile-prs)

Deployment: [![Build Status](https://app.bitrise.io/app/e1c71066b5c75521/status.svg?token=NytmjW1aEHEu-1kNaMRuiQ&branch=develop)](https://app.bitrise.io/app/e1c71066b5c75521)


Repository for the IOTA Trinity Mobile Wallet. The application is built on [React Native](https://facebook.github.io/react-native/).

## Required Dependencies

- [NodeJS](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/lang/en/)
- [React Native Dependencies](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies-2)
    - If you are targeting iOS and are using Xcode 10+, please ensure that you have enabled the legacy build system.
- [CocoaPods](https://cocoapods.org/#install) (iOS only)

## Development setup

After installing the [shared dependencies](https://github.com/iotaledger/trinity-wallet#instructions), install the mobile dependencies:
```
yarn deps:mobile
```

Then, navigate to this directory:
```
cd src/mobile
```

### iOS

Install additional dependencies with CocoaPods:
```
cd ios && pod install && cd ..
```

Run the application:

```
yarn ios:dev
```

Run the logger:

```
yarn log:ios
```

### Android

Run the application:

```
yarn android:dev
```

Run the logger:

```
yarn log:android
```
