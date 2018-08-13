# IOTA Trinity Mobile Wallet

Testing: [![Build Status](https://badge.buildkite.com/c780f148417af9e785db5143d4d46dde1e57408a07f212aff3.svg)](https://buildkite.com/iota-foundation/trinity-mobile-primary)

Deployment: [![Build Status](https://app.bitrise.io/app/e1c71066b5c75521/status.svg?token=NytmjW1aEHEu-1kNaMRuiQ&branch=develop)](https://app.bitrise.io/app/e1c71066b5c75521)


Repository for the IOTA Trinity Mobile Wallet. The application is built on [React Native](https://facebook.github.io/react-native/).

## Required Dependencies

- [NodeJS](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/lang/en/)
- [React Native Dependencies](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies-2)
    - If you are targeting iOS, please note that Xcode 10 is currently not supported by React Native v0.51. Xcode 9 or later is recommended.

## Development setup

Clone the repository from the command line:

```
git clone https://github.com/iotaledger/trinity-wallet.git
```

Install dependencies:

```
cd trinity-wallet/ && yarn full-setup
```

### iOS

Run the application:

```
cd src/mobile && yarn ios:dev
```

Run the logger:

```
yarn log:ios
```

### Android

Run the application:

```
cd src/mobile && yarn android:dev
```

Run the logger:

```
yarn log:android
```
