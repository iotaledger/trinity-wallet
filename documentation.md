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

## Technical Architecture
## Setup

#### Seed generation

This section details the seed generation methodology. Ensuring sufficient seed security begins with their generation. Improperly generated seeds are subject to attack.

IOTA is reliant on the use of trinary-based seeds comprised of 81 trytes. Seeds can only contain the capitalised letters **A-Z** and the number **9**.

Seed generation is performed during new seed set up. The user can generate a complete seed, and randomise individual characters through a UI chequerboard. The same algorithm is used for both full seed and individual letter randomisations.


Trinity seed generation follows a simple algorithm:
```
do {
randomByte = getRandomByte() // randomByte will be from 0 to 255
} while (randomByte > 243) // Keep generating until the number is 243 or less
charIndex = randomByte % 27
 ```

 For an IOTA seed, it is necessary to generate a set of 27 possible characters. A simple way of producing the necessary characters is to return the remainder from dividing a random byte of data's numeric value (0-255) by 27. And then using this to index the string of possible characters: `ABCDEFGHIJKLMNOPQRSTUVWXYZ9`. By using a number range evenly divisible by the divisor it is possible to avoid bias i.e. restricting the range from 0 to 243.

 **It is recommended that a user makes at least 5 individual letter randomisations.**

#### Seed storage

Trinity seed security follows two simple rules: minimise the time the seed spends unencrypted in memory, and encrypt the seed at rest storage.

During setup the user will create a password. The password and seed are then used as a key-value pair with iOS Keychain and Android Keystore respectively. The seed is stored encrypted and the password is used to decrypt the seed at the point of use. Access to the key stores is provided by the [React Native Sensitive Info](#sensitive-info) library.

**We advise not to use Trinity Mobile on Jailbroken or rooted devices.** If a device is jailbroken/rooted the application sandbox can be breached.

## Information Architecture

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
