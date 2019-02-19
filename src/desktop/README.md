# IOTA Trinity Desktop Wallet

Testing: [![Build Status](https://badge.buildkite.com/7116f57245f08626a7ef985f3805bfc836f1d1402224012e6a.svg)](https://buildkite.com/iota-foundation/trinity-desktop-primary)

Deployment: [![Build Status](https://badge.buildkite.com/2c9f4392dc33c7d5f164c5e59da78bf11219086a6756362d11.svg)](https://buildkite.com/iota-foundation/trinity-desktop-deployment)

This is the repository for the IOTA Trinity Desktop Wallet. The application is based on [React](https://reactjs.org) and built on [Electron](https://electronjs.org/).

## Required Dependencies

-   [NodeJS](https://nodejs.org/en/)
-   NPM (automatically installed with NodeJS)
-   Electron (`npm install electron -g`)

On **Windows** platforms you'll need to install build tools to succesfully compile native modules:

```
# Install Visual C++ Build Tools and Python 2.7
npm install --global windows-build-tools
# Install OpenSSL VC++ Static 64bit Library
git clone https://github.com/Microsoft/vcpkg C:\src\vcpkg
cd C:\src\vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg install openssl:x64-windows-static
```

On **Linux** platforms you'll need to additional packages to build native modules:

```
sudo apt install build-essential libudev-dev libusb-1.0-0 libusb-1.0-0-dev
sudo apt install gcc-4.8 g++-4.8 && export CXX=g++-4.8
# Fedora only:
yum install libusbx-devel
```

### 1. Installing dependencies

After installing the [shared dependencies](https://github.com/iotaledger/trinity-wallet#instructions), install the desktop dependencies:

```
npm run deps:desktop
```

Then, navigate to this directory:

```
cd src/desktop
```

### 2. Prepare Trinity desktop appplication

When the npm install is done you can prepare the wallet application for compilation by running:

```
npm run build
```

Then, you can either compile a production version (3a) or development version (3b) of Trinity:

### 3a. Compile Trinity desktop appplication

After the application is prepared you can compile the wallet application by running:

```
npm run compile:mac
```

Change `mac` to your operating system - `mac`, `win` or `linux`.

This will start the building process for the Trinity Desktop application and could take a couple of minutes to finish.

After the building is finished, the application executable and installation files will be located in the directory `src/desktop/out/`.

### 3b. Run Trinity desktop app in development mode

To start the application in development mode, run

```
npm start
```

## Trinity theming

To create proof checking screenshots of key wallet views for all Trinity themes, run

```
npm style:shots
```

After the command finished, the screenshots will be located in the directory `/shots/`
