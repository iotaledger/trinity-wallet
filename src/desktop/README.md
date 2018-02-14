# IOTA Trinity Desktop Wallet

This is the repository for the IOTA Trinity Desktop Wallet. The application is based on [React](https://reactjs.org) and built on [Electron](https://electronjs.org/). 

## Building the application

To build the application locally from source, follow these steps:

### 1. Install Node.JS and Electron
First you need to install Node.JS if you haven’t done that already.
Then run the following command to install electron globally.
```
npm install -g electron
````

### 2. Clone or download the Trinity repo from GitLab.
Clone the GitLab repo by running this command:
```
git clone git@gitlab.com:iota-community/wallet.git
```
Or [download](https://gitlab.com/iota-community/wallet/repository/archive.zip) the repo and extract the archive.

After cloning or downloading and extracting the application run:
```
cd src/desktop/
```
### 3. Install dependencies
Now we need to install dependencies, such as the electron installer or the React code packager. Do this by running:
```
npm install
```
### 4. Build Trinity desktop appplication
When the npm install is done you can build the wallet application by running:
```
npm run compile:mac
```
Change `mac` to your operating system - `mac`, `win` or `linux`.

This will start the building process for the Trinity desktop application and could take a couple of minutes to finish.

After the building is finished, the application executable and installation files will be located in the directory `src/desktop/out/`.

### 4. Run Trinity desktop app in development mode
To start the application in development mode, run
```
npm start
```

## Trinity UI styleguide

To start the browser based UI styleguide and theme editor, run 
```
npm run styleguide
```
After the command finished to load, open `http://localhost:1074` in a browser. Chrome is preferred as it's used in the Trinity application itself.