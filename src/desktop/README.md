# IOTA Trinity Desktop Wallet

This is the repository for the IOTA Trinity Desktop Wallet. The application is based on [React](https://reactjs.org) and built on [Electron](https://electronjs.org/).

## Building the application

To build the application locally from source, follow these steps:

### 1. Install Node.JS and Electron

First you need to install Node.JS if you haven’t done that already.
Then run the following command to install electron globally.

```
yarn global add electron
```

### 2. Clone or download the Trinity repo from GitHub.

Clone the repo by running this command:

```
git clone https://github.com/iotaledger/trinity-wallet.git
```

Or [download](https://github.com/iotaledger/trinity-wallet/archive/develop.zip) the repo and extract the archive.

After cloning or downloading and extracting the application run:

```
cd trinity-wallet
```

### 3. Install dependencies

Now we need to install dependencies, such as the electron installer or the React code packager. Do this by running:

```
yarn full-setup
```

### 4. Build Trinity desktop appplication

When the yarn install is done you can build the wallet application by running:

```
yarn compile:mac
```

Change `mac` to your operating system - `mac`, `win` or `linux`.

This will start the building process for the Trinity Desktop application and could take a couple of minutes to finish.

After the building is finished, the application executable and installation files will be located in the directory `src/desktop/out/`.

### 4. Run Trinity desktop app in development mode

To start the application in development mode, run

```
yarn start
```

## Trinity theming

To create proof checking screenshots of key wallet views for all Trinity themes, run

```
yarn style:shots
```

After the command finished, the screenshots will be located in the directory `/shots/`
