# Trinity Mobile Changelog

## v0.3.0 (13)

### Additions
- Add more translations
- Format date and time according to device locale settings
  -  Known issue: Devices set to zh-Hans-CN or other Chinese locales may show the same formats as en-GB locales
- Add progress bar to snapshot transition
- Add support for Croatian and Tamil
- Redesign UI for Receive screen
- Add option to encode an amount in QR codes
- Add explanation for why biometric authentication is disabled in some cases
- Add animation when generating receive address


### Fixes and Improvements
- Alter the way addresses are attached during snapshot transition
- Fix crash when backing up seed to Keepass2Android on Android 6.0
- Fix promotion errors with IRI 1.5.0
- Increase local PoW efficiency
- Increase address generation efficiency
- Use native methods for hashing
- Remove manual rebroadcast
- Automatically ask for biometric authentication on inactivity logout
- Display full transfer amount on transfer detail modals on the History screen
