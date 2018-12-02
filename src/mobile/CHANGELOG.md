# Trinity Mobile Changelog

## v0.5.0 (22)

### Additions
- New Crowdin translations (#335, #354, #363, #367)
- Adds SeedVault import and Export (#327)
- Add checksum component to CustomTextInput (#327)
- Updates to Argon2 password hashing (#210, #215, #327)

### Fixes and Improvements
- Compute correct transaction value for exchange/field bundles (#343)
- Ensure react-native-view-shot saves to internal cache (#344)
- Fallback to default transaction message if message contains non-ascii characters - fix garbled messages in transaction history (#351)
- Fix Android account name cut-off (#358)
- Fix chart cut-off on Android (#358)
- Fix text input keyboard avoidance issues (#358)
- Refactors various code areas (#327)
- Fixes hacky navigation workaround (#327)
- Fixes double modal bug (#327)
- Fixes terms/privacy being hidden by buttons (#327)
- Ensures first loading animation completes before login (#327)
- Update build settings to only support 64 bit iOS devices (#327)
- Remove all references to iota-wallet-shared-modules (#369)
- Fix send max button (#370)
- Promotion adjustments (#368)

## v0.4.1 (17)
### Additions
- Add more translations
- Add timeouts for API calls made to nodes
- Replace SHA256 password hashing with Scrypt - A password change is enforced on app load

### Fixes and Improvements
- Major refactoring
- Remove unused and duplicate translation strings
- Improve handling of input selection errors
- Improve address generation efficiency
- Fix incorrect error message
- Make addresses scrollable in History modals (rather than full modal)
- Verify 2FA token without need for pressing done
- Add currently-selected setting for Autopromotion, PoW, Biometric and 2FA

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
