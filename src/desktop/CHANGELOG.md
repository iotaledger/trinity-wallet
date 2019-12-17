### 1.2.0

- New: Add the ability to purchase IOTA in app through MoonPay
- Fix: Resolve issues with market data
- Update: Parse payment requests (CDAs) when pasted via url or scanned via QR
- Update: Persist chart settings

### 1.1.0

-   New: Basic auth for custom nodes (#2088)
-   New: Add ability to set a specific node for Proof of Work (#2130)
-   Update: Enable Hardened Runtime and Notarisation on macOS (#1931)
-   Update: Improved Dark theme (#2035) by @MatthewScheuerman
-   Update: Localise balance depending on language and currency (#1951)
-   Update: Revise node settings layout and relocate PoW setting (#2130)
-   Fix: Change password not working when user has only Ledger accounts (#1910)
-   Fix: Inability to add Ledger accounts with index over 999 (#1875)
-   Fix: Crash when updating from older Windows 7 release (#1913)
-   Fix: Hide retry button in macOS tray application (#1928)
-   Fix: Login failure when node auto-switching is disabled on Windows 7 (#1929)
-   Fix: Mac tray app showing zero fiat balance (#1970)
-   Fix: Snapshot transition failure (#2042)
-   Fix: Various issues with light theme, dark theme, and all theme text inputs (#2114)
-   Fix: Trinity docs link returning 404 (#2092) by @CrashTD
-   Issues closed: #272, #685, #1009, #1876, #1914, #1930, #1959, #1967

### 1.0.0

-   New: Add new UI animations
-   Fix: Do not allow tab when password fields are disabled
-   Fix: Add max length for message fields
-   Fix: Change price quoting display
-   Fix: Increase timeout for batched PoW

### 0.6.2

-   Fix: Migration not successful when migrating from 0.4.x and below to latest
-   Fix: Incorrect already spent from address errors on transaction retry
-   Fix: Incorrect transaction failure alert when successfully broadcast
-   Fix: Quorum being conducted on transaction account syncs when explicitly turned off
-   Fix: Error-related crashes
-   Update: Add remote node list endpoint back-ups
-   Update: Add more verbose error log messages
-   Update: New translations

### 0.6.1

-   Fix: Autopromotion not working as intended
-   Fix: Improve reliability of reattachment and promotion
-   Fix: Temporarily disable hardened runtime - fix Mac Ledger issues
-   Fix: Mac tray app not rendering

### 0.6.0

-   New: Automatic node management, with lots of configurability for advanced users
-   Fix: Wallet not working on Windows when username has special characters
-   Update: Auto update functionality improvements
-   Update: Add various wallet initialisation error explanations
-   Fix: Do not perform quorum when it is explicitly turned off
-   Update: Enable Hardened Runtime on MacOS
-   Fix: Wallet language resets to English
-   Fix: Windows installation should remove appData on uninstall
-   Update: New translations

### 0.5.2

-   Fix: Chart and price API calls
-   Fix: Skip retry failed transactions when password is not available
-   Fix: Fix: Ledger onboarding loading forever without reporting an error
-   Fix: Linux wallet incorrectly reporting "Missing security dependencies"
-   Update: Add Snapshot Transition reminder when an existing seed is added with 0 balance

### 0.5.1

-   Fix: Display fatal errors on preload and initialisation
-   Fix: Missing Linux application icon
-   Fix: Windows 7 not deleting files on wallet reset
-   Fix: Windows 10 wallet failing to start if Windows 7 build was installed previously, and vice versa
-   Fix: macOS tray application not displaying fiat value
-   Fix: Changing account during Snapshot transition corrupting state
-   Update: Improve user experience when adding Ledger accounts
-   Update: Add device time suggestion to out of sync errors
-   Update: Ensure the error log is always updated
-   Update: Other minor alert improvements
-   Fix: Extra parameter causing node error when reattaching and promoting
-   Update: New translations

### 0.5.0

-   Add: Node quorum - Trinity will query multiple nodes on particular API calls and only accept a result with 67% consensus, otherwise fallback to a safe result
-   Add: Replace local storage with encrypted Realm database
-   Add: Deep link support
-   Update: Remove 2FA
-   Fix: Use local time for SeedVault export file
-   Update: Add polling service for automatically retrying failed transactions
-   Update: Update dependencies
-   Fix: Bugs related to local PoW
-   Fix: Minor bugs in Realm and polling
-   Fix: Snapshot transition showing 0 balance
-   Fix: Add missing domains to external link whitelist
-   Fix: Increase timeout for getTransactionsToApprove requests
-   Fix: Improve performance by not reconstructing bundles unnecessarily
-   Update: Show modal for Ledger errors related to udev
-   Fix: Linux app icon
-   Fix: Only trigger notifications for new transactions
-   Update: Validate SeedVault before attempting to import
-   Update: Add seed export unavailable explanation
-   Update: Transaction history search feature
-   Fix: Use less strict threshold for out-of-sync checks
-   Fix: Align Entangled trunk/branch assignment with IRI
-   Update: Add iota.org node cluster
-   Update: Additional SeedVault export validation check
-   Fix: Onboarding unique seed check raises error
-   Fix: Additional account onboarding freezes after first unsuccessful try
-   Fix: Unable to cancel history refresh without Ledger device
-   Fix: Receive closes automatically on Ledger account
-   Fix: Various other bug fixes, changes and improvements

### 0.4.6

-   Fix: Unexpected wallet behaviour with account names starting with a number

### 0.4.5

-   Hotfix: Block requests to nodes running beta, alpha and release IRI releases
-   Fix: On unique seed check if target seed exists
-   Fix: Wallet crashes after succesfully sending transactions

### 0.4.4

-   Update: Unified general and account settings view
-   Update: Require two-factor authentication on view seed and wallet reset
-   Update: Input field context menu localisation
-   Update: Highlight address checksum on all views
-   Update: Check for a unique seed for local accounts
-   Fix: Address generation above index 255 not working
-   Fix: Main menu not visible on light themes
-   Fix: Password not updated for all account types
-   Fix: Incomplete account addition freezes wallet
-   Fix: Linux: Incorrect Missing dependencies warnging
-   Fix: Windows: Allow wallet window resize on top edge

### 0.4.3

-   Add: System network proxy ignore setting
-   Update: Display update alerts and force critical updates

### 0.4.2

-   Update: Require manual address generation
-   Update: Disallow Node.js runtime debugging mode
-   Update: Add indicator for over 81 char on seed field
-   Fix: Wrong spent address status check condition

### 0.4.1

-   Update: Complete address tooltip on Send page address input
-   Update: Highlight receive address checksum
-   Update: Ledger device accounts can send 0 value transactions
-   Update: Prefix SeedVault export file name with Account name
-   Update: Increase request timeout for all network calls to IRI
-   Fix: New account addition results in crash on node errors
-   Fix: Unresponsive login button if keychain is not available
-   Fix: Cannot add Ledger device account with a specific page
-   Fix: Cannot use multiple Ledger devices with the same index
-   Fix: IOTA App request does not respond when opening the app
-   Fix: Incorrect back navigation when setting Account name
-   Fix: Provide correct key index for generating addresses

### 0.4.0

-   New: Ledger hardware wallet support
-   Update: Add Wallet reset functionality for non authorised users
-   Update: Improved auto-updates functionality
-   Fix: Dark menu bar icon support for macOS

### 0.3.6

-   Fix: Automatically fixes addresses affected in version 0.3.4 (relevant to a handful of users)

### 0.3.5

-   Hotfix: Incorrect byte to trit conversion on Manual sync

### 0.3.4

-   New: Drag&drop text seed support
-   Update: Trigger 2fa verification once necessary code string length is reached
-   Update: Seed in memory use update
-   Update: Adjusted auto promotion timing
-   Fix: Reattach only if transaction falls below max depth
-   Fix: On Windows resizing wallet window using top corners does not work
-   Fix: Filled and empty paper wallet templates are mixed

### 0.3.3

-   New: Support for Persian, Kannada, and Serbian (Latin)
-   Update: Linux tutorial missing a required step
-   Fix: Printing paper wallet from settings prints a blank page on first try
-   Fix: Paper wallet prints with scrambled characters
-   Fix: Grammatical errors in German privacy policy
-   Fix: Auto update dialog raises missing locale error

### 0.3.2

-   Update: Update currency order
-   Update: Add auto retries to promotion/reattachment

### 0.3.1

-   Update: Show fiat value on Send confirmation
-   Update: Update help link to external FAQ
-   Update: Enable macOS signing

### 0.3.1-rc.2

-   Update: Set SeedVault as Recommended backup option
-   Update: Login automatically after initial onboarding
-   Update: Set default window size to 1280x720
-   Fix: Fill Amount input on Max only with available balance
-   Fix: Incorrect custom node alert locale
-   Fix: Scanning QR does not fill amount
-   Fix: Native menu not disabled on Lock screen

### 0.3.1-rc.1

-   Update: Execute PoW and address generation in non-blocking way
-   Fix: Transactions promotion allways results in error
-   Fix: Adding additional account results in empty account name
-   Fix: Non existing tray icon update triggered on linux/windows
-   Fix: Windows size is not restored on windows/linux
-   Fix: Account name capitalised in sidebar
-   Fix: Minor layout tweaks

### 0.3.0

-   New: Native Proof of Work and address generation
-   New: macOS Menu bar app
-   New: Transaction notifications
-   New: Fresh Default (old one is now Classic) and Lucky themes
-   New: Error log available via main menu
-   New: Show seed checksum in Account settings
-   Update: Dispose alerts on wallet route change
-   Update: Disable auto node switch functionality
-   Update: Add disabled Clipboard warning
-   Fix: Inaccurate chart tooltip date/time information
-   Fix: Wallet narrow layout bugfixes

### 0.2.1

-   Update: Dashboard sidebar scroll for multiple accounts
-   Update: Settings popup position broken
-   Fix: Multiple account unique seed check broken

### 0.2.0

-   New: SeedVault export feature at Account settings
-   New: Caps Lock warning on password fields
-   New: Terms and Conditions and Privacy Policy views
-   New: Trinity theming sync with live style-guide system
-   Update: Add date suffix to default SeedVault file name
-   Fix: Argon2 support for SeedVault import
-   Fix: Seed random generator bias bugfix
-   Fix: Reset Keychain on first seed onboarding
-   Fix: Add node request timeout

### 0.1.9.

-   Add: Feature to remove custom added nodes
-   Fix: Separate keychain seed accounts to individual entries
-   Fix: Adding custom node yields incorrect error

### 0.1.8.

-   New: Add seed SeedFile import/export
-   New: Store failed transaction trytes locally for retry
-   Add: Print filled paper wallet in Account settings
-   Add: Obscure option for seed input fields
-   Add: Linux missing dependencies tutorial
-   Fix: Adding additional seed does not save seed in keystore
-   Fix: Checksum missing at Account settings address list
-   Fix: Transaction details button layout broken
-   Fix: Reset onboarding when Adding additional seed is closed

### 0.1.7.

-   New: Wallet Advanced mode settings
-   New: Manual promote and rebroadcast functionality
-   New: Auto-promotion enable/disable settings
-   Fixed: On send incorrect progress steps displayed
-   Fixed: Cannot enable Two-Factor authentication
-   Fixed: Node error on Adding additional Seed hangs wallet
-   Fixed: QR seed scanning hangs wallet

### 0.1.6.

-   New: Search and Hide zero balance functionality to history view
-   Updated: Clear memory from plain text seed on onboarding
-   Updated: Restore wallet size and position on reopening
-   Fixed: Narrow sidebar layout on Setting and Dashboard views
-   Fixed: Wrong address displayed if closing Receive while generating
-   Fixed: Dynamic node list does not load correctly
-   Fixed: Adding custom node results in error
-   Fixed: Reverse address list order on Address list view
-   Fixed: on Windows wallet does not revert to original size after maximize

### 0.1.5.

-   New: Major user interface and theming update
-   New: Snapshot transition functionality
-   New: Password strength and common password check
-   Updated: Windows platform frameless application style
-   Updated: Support `iota:` and `iota://` deep links
-   Fixed: Amount input behaviour should match mobile
-   Fixed: Address list overlaps in Account settings

### 0.1.4.

-   Added password strength estimation
-   Windows platform specific UI update
-   Added step-by-step manual seed write down view
-   Added snapshot transition functionality
-   Theme color update and usage fixes

### 0.1.3.

-   New: Multi-account background polling
-   New: Automatic random node switch mode
-   New: Linux missing libraries check and setup tutorial
-   Updated: Windows and Linux application icon assets
-   Updated: Settings views unified flow and layout
-   Fixed: Missing character limit and validation on message field
-   Fixed: Adding additional seed fail crashes wallet
-   Fixed: On linux/windows VM can`t send transactions
-   Fixed: Onboarding back link crashes the wallet
-   Fixed: UI scrollbars ugly or missing
-   Fixed: Cannot copy address in Address list
-   Fixed: Multiple smaller UI and localisation fixes

### 0.1.2.

-   Added: background polling
-   Added: a bunch of missing translations
-   Added: auto focus on input fields
-   Added: option to change wallet lock time-out in Advanced settings
-   Updated: encrypted seed storage uses keychain on mac, Credential Vault on Windows and libsceret on linux
-   Updated: history card ui and functionallity
-   Updated: chart converts market cap and volume to wallets currency
-   Fixed: Seed validation broken on onboarding
-   Fixed: Two-factor disable flow broken
-   Fixed: Clipboard clears on onboarding even seed is not generated
-   Fixed: Node settings hang forever when invalid node address provided
-   Fixed: History filter views show incorrect items
-   Fixed: Empty account name brakes wallet
-   Fixed: Value field conversion broken
-   Fixed: dark theme elements unreadable

### 0.1.1.

-   Amount value input now has a unit dropdown instead of switch
-   History card transaction details are contained in the card itself
-   Fixed: Sending transactions with value throws generic error
-   Fixed: Un-closable wallet on linux and windows wallet
-   Fixed: Two-factor authentication locks out of the wallet
-   Fixed: Receive address does not reset when reopening Receive view
-   Fixed: QR code not scannable with dark theme active
-   Fixed: Opaque wallet lock window background
-   Fixed: Amount value input incorrect fiat conversion
-   Fixed: Balance fiat value incorrectly rounded
-   Fixed: History transaction details don`t match selected item
-   Fixed: Seed generator view resets seed when navigating back from Backup seed
-   Missing translations added
-   Minor visual bugfixes here and there
-   Removed windows max size limit
