/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Scrollbar from 'ui/components/Scrollbar';
import Icon from 'ui/components/Icon';

import settings from '../../../package.json';

import css from './about.scss';

/**
 * About window component
 */
class About extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        visible: false,
    };

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    /**
     * Proxy native menu triggers to an action
     * @param {string} Item - Triggered menu item
     */
    menuToggle(item) {
        this.setState({
            visible: item === 'about',
        });
    }

    render() {
        const { visible } = this.state;
        const { t } = this.props;

        return (
            <Modal variant="global" isOpen={visible} onClose={() => this.setState({ visible: false })}>
                <section className={css.about}>
                    <Icon icon="iota" size={48} />
                    <h1>Trinity Wallet</h1>
                    <h2>
                        v{settings.version} <small>BETA</small>
                    </h2>

                    <article>
                        <Scrollbar>
                            <h5>0.4.6</h5>
                            <ul>
                                <li>- Fix: Unexpected wallet behaviour with account names starting with a number</li>
                            </ul>
                            <h5>0.4.5</h5>
                            <ul>
                                <li>- Hotfix: Block requests to nodes running beta, alpha and release IRI releases</li>
                                <li>- Fix: On unique seed check if target seed exists</li>
                                <li>- Fix: Wallet crashes after succesfully sending transactions</li>
                            </ul>
                            <h5>0.4.4</h5>
                            <ul>
                                <li>- Update: Unified general and account settings view</li>
                                <li>- Update: Require two-factor authentication on view seed and wallet reset</li>
                                <li>- Update: Input field context menu localisation</li>
                                <li>- Update: Highlight address checksum on all views</li>
                                <li>- Update: Check for a unique seed for local accounts</li>
                                <li>- Fix: Address generation above index 255 not working</li>
                                <li>- Fix: Main menu not visible on light themes</li>
                                <li>- Fix: Password not updated for all account types</li>
                                <li>- Fix: Incomplete account addition freezes wallet</li>
                                <li>- Fix: Linux: Incorrect Missing dependencies warnging</li>
                                <li>- Fix: Windows: Allow wallet window resize on top edge</li>
                            </ul>
                            <h5>0.4.3</h5>
                            <ul>
                                <li>- Add: System network proxy ignore setting</li>
                                <li>- Update: Display update alerts and force critical updates</li>
                            </ul>
                            <h5>0.4.2</h5>
                            <ul>
                                <li>- Update: Require manual address generation</li>
                                <li>- Update: Disallow Node.js runtime debugging mode</li>
                                <li>- Update: Add indicator for over 81 char on seed field</li>
                                <li>- Fix: Wrong spent address status check condition</li>
                            </ul>
                            <h5>0.4.1</h5>
                            <ul>
                                <li>- Update: Complete address tooltip on Send page address input</li>
                                <li>- Update: Highlight receive address checksum</li>
                                <li>- Update: Ledger device accounts can send 0 value transactions</li>
                                <li>- Update: Prefix SeedVault export file name with Account name</li>
                                <li>- Update: Increase request timeout for all network calls to IRI</li>
                                <li>- Fix: New account addition results in crash on node errors</li>
                                <li>- Fix: Unresponsive login button if keychain is not available</li>
                                <li>- Fix: Cannot add Ledger device account with a specific page</li>
                                <li>- Fix: Cannot use multiple Ledger devices with the same index</li>
                                <li>- Fix: IOTA App request does not respond when opening the app</li>
                                <li>- Fix: Incorrect back navigation when setting Account name</li>
                                <li>- Fix: Provide correct key index for generating addresses</li>
                            </ul>
                            <h5>0.4.0</h5>
                            <ul>
                                <li>- New: Ledger hardware wallet support</li>
                                <li>- Update: Add Wallet reset functionality for non authorised users</li>
                                <li>- Update: Improved auto-updates functionality</li>
                                <li>- Fix: Dark menu bar icon support for macOS</li>
                            </ul>
                            <h5>0.3.6</h5>
                            <ul>
                                <li>
                                    - Fix: Automatically fixes addresses affected in version 0.3.4 (relevant to a
                                    handful of users)
                                </li>
                            </ul>
                            <h5>0.3.5</h5>
                            <ul>
                                <li>- Hotfix: Incorrect byte to trit conversion on Manual sync</li>
                            </ul>
                            <h5>0.3.4</h5>
                            <ul>
                                <li>- New: Drag&amp;drop text seed support</li>
                                <li>- Update: Trigger 2fa verification once necessary code string length is reached</li>
                                <li>- Update: Seed in memory use update</li>
                                <li>- Update: Adjusted auto promotion timing</li>
                                <li>- Fix: Reattach only if transaction falls below max depth</li>
                                <li>- Fix: On Windows resizing wallet window using top corners does not work</li>
                                <li>- Fix: Filled and empty paper wallet templates are mixed</li>
                            </ul>
                            <h5>0.3.3</h5>
                            <ul>
                                <li>- New: Support for Persian, Kannada, and Serbian (Latin)</li>
                                <li>- Update: Linux tutorial missing a required step</li>
                                <li>- Fix: Printing paper wallet from settings prints a blank page on first try</li>
                                <li>- Fix: Paper wallet prints with scrambled characters</li>
                                <li>- Fix: Grammatical errors in German privacy policy</li>
                                <li>- Fix: Auto update dialog raises missing locale error</li>
                            </ul>
                            <h5>0.3.2</h5>
                            <ul>
                                <li>Update: Update currency order</li>
                                <li>Update: Add auto retries to promotion/reattachment</li>
                            </ul>
                            <h5>0.3.1</h5>
                            <ul>
                                <li>Update: Show fiat value on Send confirmation</li>
                                <li>Update: Update help link to external FAQ</li>
                                <li>Update: Enable macOS signing</li>
                            </ul>
                            <h5>0.3.1-rc.2</h5>
                            <ul>
                                <li>Update: Set SeedVault as Recommended backup option</li>
                                <li>Update: Login automatically after initial onboarding</li>
                                <li>Update: Set default window size to 1280x720</li>
                                <li>Fix: Fill Amount input on Max only with available balance</li>
                                <li>Fix: Incorrect custom node alert locale</li>
                                <li>Fix: Scanning QR does not fill amount</li>
                                <li>Fix: Native menu not disabled on Lock screen</li>
                            </ul>
                            <h5>0.3.1-rc.1</h5>
                            <ul>
                                <li>Update: Execute PoW and address generation in non-blocking way</li>
                                <li>Fix: Transactions promotion allways results in error</li>
                                <li>Fix: Adding additional account results in empty account name</li>
                                <li>Fix: Non existing tray icon update triggered on linux/windows</li>
                                <li>Fix: Windows size is not restored on windows/linux</li>
                                <li>Fix: Account name capitalised in sidebar</li>
                                <li>Fix: Minor layout tweaks</li>
                            </ul>
                            <h5>0.3.0</h5>
                            <ul>
                                <li>New: Native Proof of Work and address generation</li>
                                <li>New: macOS Menu bar app</li>
                                <li>New: Transaction notifications</li>
                                <li>New: Fresh Default (old one is now Classic) and Lucky themes</li>
                                <li>New: Error log available via main menu</li>
                                <li>New: Show seed checksum in Account settings</li>
                                <li>Update: Dispose alerts on wallet route change</li>
                                <li>Update: Disable auto node switch functionality</li>
                                <li>Update: Add disabled Clipboard warning</li>
                                <li>Fix: Inaccurate chart tooltip date/time information</li>
                                <li>Fix: Wallet narrow layout bugfixes</li>
                            </ul>
                            <h5>0.2.1</h5>
                            <ul>
                                <li>Update: Dashboard sidebar scroll for multiple accounts</li>
                                <li>Update: Settings popup position broken</li>
                                <li>Fix: Multiple account unique seed check broken</li>
                            </ul>
                            <h5>0.2.0</h5>
                            <ul>
                                <li>New: SeedVault export feature at Account settings</li>
                                <li>New: Caps Lock warning on password fields</li>
                                <li>New: Terms and Conditions and Privacy Policy views</li>
                                <li>New: Trinity theming sync with live style-guide system</li>
                                <li>Update: Add date suffix to default SeedVault file name</li>
                                <li>Fix: Argon2 support for SeedVault import</li>
                                <li>Fix: Seed random generator bias bugfix</li>
                                <li>Fix: Reset Keychain on first seed onboarding</li>
                                <li>Fix: Add node request timeout</li>
                            </ul>
                            <h5>0.1.9.</h5>
                            <ul>
                                <li>Add: Feature to remove custom added nodes</li>
                                <li>Fix: Separate keychain seed accounts to individual entries</li>
                                <li>Fix: Adding custom node yields incorrect error</li>
                            </ul>
                            <h5>0.1.8.</h5>
                            <ul>
                                <li>New: Add seed SeedFile import/export</li>
                                <li>New: Store failed transaction trytes locally for retry</li>
                                <li>Add: Print filled paper wallet in Account settings</li>
                                <li>Add: Obscure option for seed input fields</li>
                                <li>Add: Linux missing dependencies tutorial</li>
                                <li>Fix: Adding additional seed does not save seed in keystore</li>
                                <li>Fix: Checksum missing at Account settings address list</li>
                                <li>Fix: Transaction details button layout broken</li>
                                <li>Fix: Reset onboarding when Adding additional seed is closed</li>
                            </ul>
                            <h5>0.1.7.</h5>
                            <ul>
                                <li>New: Wallet Advanced mode settings</li>
                                <li>New: Manual promote and rebroadcast functionality</li>
                                <li>New: Auto-promotion enable/disable settings</li>
                                <li>Fixed: On send incorrect progress steps displayed</li>
                                <li>Fixed: Cannot enable Two-Factor authentication</li>
                                <li>Fixed: Node error on Adding additional Seed hangs wallet</li>
                                <li>Fixed: QR seed scanning hangs wallet</li>
                            </ul>
                            <h5>0.1.6.</h5>
                            <ul>
                                <li>New: Search and Hide zero balance functionality to history view</li>
                                <li>Updated: Clear memory from plain text seed on onboarding</li>
                                <li>Updated: Restore wallet size and position on reopening</li>
                                <li>Fixed: Narrow sidebar layout on Setting and Dashboard views</li>
                                <li>Fixed: Wrong address displayed if closing Receive while generating</li>
                                <li>Fixed: Dynamic node list does not load correctly</li>
                                <li>Fixed: Adding custom node results in error</li>
                                <li>Fixed: Reverse address list order on Address list view</li>
                                <li>Fixed: on Windows wallet does not revert to original size after maximize</li>
                            </ul>
                            <h5>0.1.5.</h5>
                            <ul>
                                <li>New: Major user interface and theming update</li>
                                <li>New: Snapshot transition functionality</li>
                                <li>New: Password strength and common password check</li>
                                <li>Updated: Windows platform frameless application style</li>
                                <li>Updated: Support `iota:` and `iota://` deep links</li>
                                <li>Fixed: Amount input behaviour should match mobile</li>
                                <li>Fixed: Address list overlaps in Account settings</li>
                            </ul>

                            <h5>0.1.4.</h5>
                            <ul>
                                <li>Added password strength estimation</li>
                                <li>Windows platform specific UI update</li>
                                <li>Added step-by-step manual seed write down view</li>
                                <li>Added snapshot transition functionality</li>
                                <li>Theme color update and usage fixes</li>
                            </ul>

                            <h5>0.1.3.</h5>
                            <ul>
                                <li>New: Multi-account background polling</li>
                                <li>New: Automatic random node switch mode</li>
                                <li>New: Linux missing libraries check and setup tutorial</li>
                                <li>Updated: Windows and Linux application icon assets</li>
                                <li>Updated: Settings views unified flow and layout</li>
                                <li>Fixed: Missing character limit and validation on message field</li>
                                <li>Fixed: Adding additional seed fail crashes wallet</li>
                                <li>Fixed: On linux/windows VM can`t send transactions</li>
                                <li>Fixed: Onboarding back link crashes the wallet</li>
                                <li>Fixed: UI scrollbars ugly or missing</li>
                                <li>Fixed: Cannot copy address in Address list</li>
                                <li>Fixed: Multiple smaller UI and localisation fixes</li>
                            </ul>
                            <h5>0.1.2.</h5>
                            <ul>
                                <li>Added: background polling</li>
                                <li>Added: a bunch of missing translations</li>
                                <li>Added: auto focus on input fields</li>
                                <li>Added: option to change wallet lock time-out in Advanced settings</li>
                                <li>
                                    Updated: encrypted seed storage uses keychain on mac, Credential Vault on Windows
                                    and libsceret on linux
                                </li>
                                <li>Updated: history card ui and functionallity </li>
                                <li>Updated: chart converts market cap and volume to wallets currency</li>
                                <li>Fixed: Seed validation broken on onboarding</li>
                                <li>Fixed: Two-factor disable flow broken</li>
                                <li>Fixed: Clipboard clears on onboarding even seed is not generated</li>
                                <li>Fixed: Node settings hang forever when invalid node address provided</li>
                                <li>Fixed: History filter views show incorrect items</li>
                                <li>Fixed: Empty account name brakes wallet</li>
                                <li>Fixed: Value field conversion broken</li>
                                <li>Fixed: dark theme elements unreadable</li>
                            </ul>
                            <h5>0.1.1.</h5>
                            <ul>
                                <li>Amount value input now has a unit dropdown instead of switch</li>
                                <li>History card transaction details are contained in the card itself</li>
                                <li>Fixed: Sending transactions with value throws generic error</li>
                                <li>Fixed: Un-closable wallet on linux and windows wallet</li>
                                <li>Fixed: Two-factor authentication locks out of the wallet</li>
                                <li>Fixed: Receive address does not reset when reopening Receive view</li>
                                <li>Fixed: QR code not scannable with dark theme active</li>
                                <li>Fixed: Opaque wallet lock window background</li>
                                <li>Fixed: Amount value input incorrect fiat conversion</li>
                                <li>Fixed: Balance fiat value incorrectly rounded</li>
                                <li>Fixed: History transaction details don`t match selected item</li>
                                <li>Fixed: Seed generator view resets seed when navigating back from Backup seed</li>
                                <li>Missing translations added</li>
                                <li>Minor visual bugfixes here and there</li>
                                <li>Removed windows max size limit</li>
                            </ul>
                        </Scrollbar>
                    </article>
                    <footer>
                        <Button onClick={() => this.setState({ visible: false })} variant="dark">
                            {t('close')}
                        </Button>
                    </footer>
                </section>
            </Modal>
        );
    }
}

export default withI18n()(About);
