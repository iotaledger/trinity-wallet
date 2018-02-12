## Information Architecture
This section details the overall flow and gives an overview of Trinity’s complete feature set.
##### [Setup](#setup-1)
- [Seed Generation](#seed-generation)
- [Seed Storage](#seed-storage)

##### [Main dashboard](#dashboard)
- [Account Management](#account-management-1)
- [Node Selection](#node-selection)
- [Polling](#polling)
- [Address Management](#address-management)
- [Two-factor Authentication](#two-factor-authentication)
- [Biometric Authentication](#biometric-authentication)
- [Snapshot Transition](#transition)
- [Automatic Promotion/Reattachment](#automatic-promotionreattachment)

## Technical Architecture
This section highlights all important APIs used in Trinity.
- [IRI](#iri)
- [Cryptocompare & Fixer](#cryptocompare)
- [i18next](#i18next)
- [Bitrise](#bitrise)
- [Fastlane](#fastlane)
- [React Native Sensitive Info](#react-native-sensitive-info)

## Information Architecture
## Setup

#### Seed generation

This section details the seed generation methodology. Ensuring sufficient seed security begins with their generation. Improperly generated seeds are subject to attack.

IOTA is reliant on the use of trinary-based seeds comprised of 81 trytes. Seeds can only contain the capitalised letters **A-Z** and the number **9**.

Seed generation is performed during new seed set up. The user can generate a complete seed, and randomise individual characters through a UI chequerboard. The same algorithm is used for both full seed and individual letter randomisations.

**It is recommended that a user makes at least 5 individual letter randomisations.**


Trinity seed generation follows a simple algorithm:
```
do {
randomByte = getRandomByte() // randomByte will be from 0 to 255
} while (randomByte > 243) // Keep generating until the number is 243 or less
charIndex = randomByte % 27
 ```

 For an IOTA seed, it is necessary to generate a set of 27 possible characters. A simple way of producing the necessary characters is to return the remainder from dividing a random byte's numeric value (0-255) by 27. And then using this to index the string of possible characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZ9`. By using a number range evenly divisible by the divisor it is possible to avoid bias i.e. by restricting the range from 0 to 243.

 Mobile OS kernels can accumulate randomness through various unpredictable input sources like the accelerometer, keypress timings and circuitry signal interference <sup>[1](#mobile-randomness)</sup>. This entropy pool can be drawn upon to generate randomness by making /dev/random system calls. Trinity obtains random bytes through [`java.util.SecureRandom`](https://docs.oracle.com/javase/7/docs/api/java/security/SecureRandom.html) and [`SecRandomCopyBytes()`](https://developer.apple.com/documentation/security/1399291-secrandomcopybytes) on Android and iOS respectively.

 The library used to generate random bytes is  [react-native-securerandom](https://github.com/rh389/react-native-securerandom).

#### Seed storage

Trinity seed security follows two simple rules: minimise the time the seed spends unencrypted in memory, and encrypt the seed at rest storage.

During setup the user will create a password. The password and seed are then used as a key-value pair in iOS Keychain and Android Keystore respectively. The seed is stored encrypted and the password is used to decrypt the seed at the point of use. Access to the key stores is provided by the [React Native Sensitive Info](#sensitive-info) library.

The seed is stored encrypted at every possible instance. The only time the seed lies unencrypted in memory is during seed setup i.e. the seed is not encrypted prior to setting a password. This does not pose a problem for security. Android and iOS operate an application sandbox environment, where application memory is only accessible to the application itself. Encryption is used to mitigate the risk of an attacker gaining access to the application sandbox on a compromised device. If the user is in the process of setting up their seed, it can be safely assumed that their device has not been compromised.

**We advise not to use Trinity Mobile on Jailbroken or rooted devices.** If a device is jailbroken/rooted the application sandbox can be breached.


### Account Management

#### Multi-account management

Trinity provides multi-account support. You can store more than one seed in your wallet. This enables users to split their funds between multiple seeds and access them from within the same application. If you add more than one seed to your Trinity wallet, you can swap between accounts by pressing the dropdown located at the top of the main application dashboard.

A number of account management functions are provided. These included **View seed**, **View addresses**, **Delete account**, **Add new account** and **Change password**.

#### Node Selection

Trinity is a lightwallet. It relies on a connection to a full node running the IRI. This means that Trinity relies on a third party server for accessing address balances and relaying transactions to the Tangle. Light wallets are suitable for devices like smartphones, owing to their lightweight nature.

##### Node balancing

Trinity provides a built-in node-balancing service. A list of approved nodes is maintained externally by **iota.dance**. When you open your wallet, a healthy node with a low current load is selected.

Should you wish to turn off node balancing, please head to the **Select node** page in **Advanced settings**. It is also possible to add your own **custom node**.

#### Polling

Trinity carries out a series of network calls to ensure that your wallet information is kept upto date. Polling comprises of two key components: market data and account polling. Latest market data, price data, currency data, transfers and balances are fetched in sequence.

Please note: **Trinity does not update account or market information if the application is minimised. Polling only takes place if the app is currently open.**

#### Automatic Promotion/Reattachment

To ensure transactions are confirmed on the Tangle, it is often necessary to promote or reattach them. An explanation of promotion and reattachment can be found [here](https://iota.stackexchange.com/a/801). If it is possible to promote a pending transaction, Trinity will do so automatically. However it is sometimes necessary to first attach the transaction to the Tangle before then promoting that reattachment. This will also occur automatically.

Should you wish to enable **manual promotion and reattachment** please turn on **Expert** mode in the settings.


Please note: **Trinity does not promote/reattatch transfers if the application is minimised. Automatic promotion/reattachment only takes place if the app is currently open.**

#### Address Management

Trinity is a stateful wallet, meaning that your address balances and transaction history are stored locally on your device. This ensures that loading times are faster and facilitates a wider array of wallet features, including multi-account support.

#### Two-Factor Authentication

Two factor authentication provides an optional additional security layer for Trinity users. This can be activated by adding a TOTP key provided by Trinity to a 2FA app like Google Authenticator or Authy.

Please note: **Enabling two-factor authentication does not provide any additional security if your 2FA application is on the same device as Trinity. It only provides additional security through use of a second device**


#### Biometric Authentication

For ease of use, users are given the option to use biometric authentication as an alternative to logging in to the wallet. We use [react-native-fingerprint-scanner](https://github.com/hieuvp/react-native-fingerprint-scanner) to implement this. For Android, we support MeiZu's [Fingerprint Authentication API](https://translate.google.com/translate?sl=auto&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fopen-wiki.flyme.cn%2Findex.php%3Ftitle%3D%25E6%258C%2587%25E7%25BA%25B9%25E8%25AF%2586%25E5%2588%25ABAPI&edit-text=&act=url) and Samsung's [Pass SDK](http://developer.samsung.com/galaxy/pass). For iOS, we support Apple's [Touch ID](https://developer.apple.com/documentation/localauthentication) and [Face ID](https://images.apple.com/business/docs/FaceID_Security_Guide.pdf).

Please note: **Enabling biometric authentication may pose a potential security risk. Anyone who has their fingerprint or face registered in your device will be able to access your wallet.**

#### Snapshot Transition

Every so often, a snapshot is performed on the Tangle. Snapshots are performed to condense the size of the Tangle. All transaction data is deleted and only nonzero address balance are retained. As Trinity is stateful, it will store a copy of your transactional history after a snapshot.

Following a snapshot it is necessary to manually attach addresses with the IOTA light wallet. Trinity provides a feature to do this quickly and automatically. The snapshot transition function can be found in **Advanced settings**. Whenever a snapshot occurs, you should perform a snapshot transition in Trinity.

## Technical Architecture

#### IRI
Trinity consumes endpoints from any selected full node for keeping local account up-to-date with the tangle.

#### Cryptocompare and Fixer

Trinity pulls latest market data from [Cryptocompare](https://www.cryptocompare.com/) across BTC, ETH, USD and EUR pairings. This data is used to populate the chart and provide up-to-date price and market information.

Foreign exchange rates are obtained from [Fixer](http://fixer.io/) to provide up-to-date IOTA-fiat conversion.

#### i18next
For multilingual support.

#### Bitrise
For continuous delivery and deployment for the mobile applications.

#### Fastlane
For automation of various deployment steps for App Store/Play Store.

<a name="mobile-randomness">1.</a> J. Krhovjak, P. Svenda, and V. Matyas, “The sources of randomness in mobile devices,” In Proceeding of NORDSEC, 2007.
