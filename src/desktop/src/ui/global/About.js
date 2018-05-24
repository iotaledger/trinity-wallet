/*global Electron*/
import React from 'react';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Scrollbar from 'ui/components/Scrollbar';
import Icon from 'ui/components/Icon';

import { DESKTOP_VERSION } from 'config';

import css from './about.scss';

/**
 * About window component
 */
class About extends React.PureComponent {
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

    menuToggle(item) {
        switch (item) {
            case 'about':
                this.setState({
                    visible: true,
                });
                break;
        }
    }

    render() {
        const { visible } = this.state;

        return (
            <Modal variant="global" isOpen={visible} onClose={() => this.setState({ visible: false })}>
                <section className={css.about}>
                    <Icon icon="iota" size={48} />
                    <h1>Trinity Wallet</h1>
                    <h2>
                        v{DESKTOP_VERSION} <small>BETA</small>
                    </h2>

                    <article>
                        <Scrollbar>
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
                    <p>
                        <strong>BETA version warning:</strong> Do not send large amounts with this wallet.
                    </p>
                    <footer>
                        <Button onClick={() => this.setState({ visible: false })} variant="dark">
                            Close
                        </Button>
                    </footer>
                </section>
            </Modal>
        );
    }
}

export default About;
