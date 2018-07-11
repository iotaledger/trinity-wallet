# Trinity Mobile Changelog

## v0.3.0 (13)

### Additions
- 	Add more translations
- 	Format date and time according to device locale settings
    ◦	Known issue: Devices set to zh-Hans-CN or other Chinese locales may show the same formats as en-GB locales
- 	Add progress bar to snapshot transition
- 	Add support for Croatian and Tamil
- 	Redesign UI/UX for Receive screen
- 	Autogenerate addresses
- 	Add option to add an amount to the receive address QR code
- 	Add explanation for why biometric authentication is disabled on first login
- 	Add letter scramble animation when generating receive address on iOS
- 	Automatically ask for fingerprint/Face ID on inactivity logout
- 	Display two transaction items (sent and received) when sending to self

### Fixes and Improvements
- 	Update all themes -> colour changes and text field borders (see light theme in particular)
- 	Alter the way addresses are attached during snapshot transition
    ◦	Known issue: Attach transactions will clutter history. We will be adding a filter shortly.
- 	Fix amount precision on send i.e. ensure no valid amounts return INVALID
- 	Fix crash when backing up seed to Keepass2Android on Android 6.0
- 	Fix promotion errors with IRI 1.5.0
- 	Improve local PoW performance
- 	Improve tryte conversion performance
- 	Improve address generation performance
- 	Use native methods for hashing -> improve performance
- 	Update biometric authentication setup UI 
- 	Remove manual rebroadcast
- 	Automatically ask for biometric authentication on inactivity logout
- 	Display full transfer amount on transfer modals on the History screen
