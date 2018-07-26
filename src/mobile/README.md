# IOTA Trinity Mobile Wallet

Repository for the IOTA Trinity Mobile Wallet. The application is built on [React Native](https://facebook.github.io/react-native/).

## Required Dependencies

- [NodeJS](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/lang/en/)
- [React Native Dependencies](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies-2)

## Development setup

Clone the repository from the command line:

```
git clone https://github.com/iotaledger/trinity-wallet.git
```

Install dependencies:

```
cd trinity-wallet/ && yarn
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
