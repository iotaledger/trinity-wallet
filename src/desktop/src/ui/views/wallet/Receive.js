import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';
import { runTask } from 'worker';

import { setReceiveAddress } from 'actions/wallet';
import { generateAlert } from 'actions/alerts';

import { getSeed } from 'libs/crypto';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import Text from 'ui/components/input/Text.js';

import css from './receive.css';

/**
 * Send transactions component
 */
class Receive extends React.PureComponent {
    static propTypes = {
        /** Current account object */
        account: PropTypes.object.isRequired,
        /** Current account name */
        accountName: PropTypes.string.isRequired,
        /** Current receive address */
        receiveAddress: PropTypes.string.isRequired,
        /** Current active seed index */
        seedIndex: PropTypes.number,
        /** Current password value */
        password: PropTypes.string,
        /** Is the wallet currently syncing */
        isSyncing: PropTypes.bool.isRequired,
        /** Is the wallet currently transitioning */
        isTransitioning: PropTypes.bool.isRequired,
        /** Is wallet generating receive address state */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Set receive address
         * @param {string} address - target receive address
         * @ignore
         */
        setReceiveAddress: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        message: '',
    };

    componentWillUnmount() {
        if (this.props.receiveAddress) {
            this.props.setReceiveAddress(' ');
        }
    }

    onGeneratePress = async () => {
        const { password, accountName, account, seedIndex, isSyncing, isTransitioning, generateAlert, t } = this.props;

        if (isSyncing || isTransitioning) {
            return generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }

        const seed = await getSeed(seedIndex, password);

        runTask('generateNewAddress', [seed, accountName, account]);
    };

    render() {
        const { t, receiveAddress, isGeneratingReceiveAddress } = this.props;
        const { message } = this.state;

        const content =
            receiveAddress.length > 2 ? receiveAddress.match(/.{1,3}/g).join(' ') : new Array(27).join('XXX ');

        return (
            <div className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : null)}>
                <p className={css.address}>
                    <QRCode value={JSON.stringify({ address: receiveAddress, message: message })} size={150} />
                    <Clipboard
                        text={receiveAddress}
                        title={t('receive:addressCopied')}
                        success={t('receive:addressCopiedExplanation')}
                    >
                        {content}
                    </Clipboard>
                </p>
                <Text value={message} label="Custom message" onChange={(value) => this.setState({ message: value })} />
                <Button onClick={this.onGeneratePress} loading={isGeneratingReceiveAddress}>
                    {t('receive:generateNewAddress')}
                </Button>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    receiveAddress: state.wallet.receiveAddress,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSyncing: state.ui.isSyncing,
    isTransitioning: state.ui.isTransitioning,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    password: state.wallet.password,
    seedIndex: state.wallet.seedIndex,
});

const mapDispatchToProps = {
    setReceiveAddress,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Receive));
