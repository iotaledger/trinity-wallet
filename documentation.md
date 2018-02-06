## Information Architecture
This section details the overall flow and gives an overview of Trinity’s complete feature set.
##### [Setup](#setup)
- [Seed Generation](#new-seed)
- [Seed Storage](#seed-storage)

##### [Account Management](#account-mgmt)
- [Multi-account management](#multi-account)
- [Node Selection](#node-selection)
- [Polling](#polling)
- [Address Management](#address-mgmt)
- [Two factor authentication](#2FA)
- [Biometric authentication](#biometric)
- [Automatic Promotion/Reattachment](#auto-reattach)

## Technical Architecture
This section highlights all important APIs consumed in Trinity.
- [IRI](#iri)
- [Cryptocompare](#cryptocompare)
- [Fixer](#fixer)
- [i18next](#i18next)
- [Randombytes](#randombytes)
- [Bitrise](#bitrise)
- [Fastlane](#fastlane)

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

 For an IOTA seed, it is necessary to generate a set of 27 possible characters. A simple way of producing the necessary characters is to return the remainder from dividing a random byte of data's numeric value (0-255) by 27. And then using this to index the string of possible characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZ9`. By using a number range evenly divisible by the divisor it is possible to avoid bias i.e. restricting the range from 0 to 243.

 Mobile OS kernels can accumulate randomness through various unpredictable input sources like the accelerometer, keypress timings and circuitry signal interference <sup>[1](#mobile-randomness)</sup>. This entropy pool can be drawn upon to generate randomness by calling /dev/random system calls. Trinity obtains random bytes through [`java.util.SecureRandom`](https://docs.oracle.com/javase/7/docs/api/java/security/SecureRandom.html) and [`SecRandomCopyBytes()`](https://developer.apple.com/documentation/security/1399291-secrandomcopybytes) on Android and iOS respectively.


#### Seed storage

Trinity seed security follows two simple rules: minimise the time the seed spends unencrypted in memory, and encrypt the seed at rest storage.

During setup the user will create a password. The password and seed are then used as a key-value pair with iOS Keychain and Android Keystore respectively. The seed is stored encrypted and the password is used to decrypt the seed at the point of use. Access to the key stores is provided by the [React Native Sensitive Info](#sensitive-info) library.

The seed is stored encrypted at every possible instance. The only time the seed lies unencrypted in memory is during seed setup i.e. the seed is not encrypted prior to setting a password. This does not pose a problem for security. Android and iOS operate an application sandbox environment, where application memory is only accessible to the application itself. Encryption is used to mitigate the risk of an attacker gaining access to the application sandbox on a compromised device. If the user is in the process of setting up their seed, it can be safely assumed that their device has not been compromised.

**We advise not to use Trinity Mobile on Jailbroken or rooted devices.** If a device is jailbroken/rooted the application sandbox can be breached.


### Account Management

#### Multi-account management

Trinity provides multi-account support. You can store more than one seed in your wallet.

#### Node Selection

Trinity is a lightwallet. It relies on connection to nodes running the IRI.

#### Polling

Polling comprises of two key components: market data and account polling.

#### Address Management

Trinity is a stateful wallet.

#### Two factor authentication

Two factor authentication provides an optional additional security layer for Trinity users.

#### Biometric authentication

For ease of use, users are given the option to use a form of biometric authentication as an alternative when logging in to the wallet. We use [react-native-fingerprint-scanner](https://github.com/hieuvp/react-native-fingerprint-scanner) to implement this. For Android, we support MeiZu's [Fingerprint Authentication API](https://translate.google.com/translate?sl=auto&tl=en&js=y&prev=_t&hl=en&ie=UTF-8&u=http%3A%2F%2Fopen-wiki.flyme.cn%2Findex.php%3Ftitle%3D%25E6%258C%2587%25E7%25BA%25B9%25E8%25AF%2586%25E5%2588%25ABAPI&edit-text=&act=url) and Samsung's [Pass SDK](http://developer.samsung.com/galaxy/pass). For iOS, we support Apple's [Touch ID](https://developer.apple.com/documentation/localauthentication) and [Face ID](https://images.apple.com/business/docs/FaceID_Security_Guide.pdf).

**Please note that enabling these alternative options of authentication may pose a potential security risk to the security of your wallet. Anyone who has their fingerprint or face registered in your device could be able to access your wallet. If you have any concerns, please refer to the linked documentation for your device. These options are alternatives for a password and should not be used as a substitute because of the aforementioned reasons. If you have doubts, we advise that you do not enable this option.**

#### Automatic Promotion/Reattachment

To ensure transactions are confirmed on the Tangle, it is often necessary to promote or reattach them.

## Technical Architecture

#### IRI
Trinity consumes endpoints from any selected full node for keeping local account up-to-date with the tangle.

#### Cryptocompare
Trinity consumes public APIs from cryptocompare for keeping wallet up-to-date with latest currency prices.

#### Fixer
Trinity consumes public APIs from fixer.io for currency conversions

#### i18next
For multilingual support.

#### Randombytes
Trinity uses react-native version of random-bytes for secure seed generation.

#### Bitrise
For continuous delivery and deployment for the mobile applications.

#### Fastlane
For automation of various deployment steps for App Store/Play Store.

#### React Native Sensitive Info

For access to Android and iOS key stores.

<a name="mobile-randomness">1.</a> J. Krhovjak, P. Svenda, and V. Matyas, “The sources of randomness in mobile devices,” In Proceeding of NORDSEC, 2007.
