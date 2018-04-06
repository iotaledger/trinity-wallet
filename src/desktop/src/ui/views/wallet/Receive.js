import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';
import { runTask } from 'worker';
import { setReceiveAddress } from 'actions/wallet';

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
        /** Is wallet generating receive address state */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** Set receive address
         * @param {string} address - target receive address
         * @ignore
         */
        setReceiveAddress: PropTypes.func.isRequired,
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
        const { password, accountName, account, seedIndex } = this.props;

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
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    password: state.wallet.password,
    seedIndex: state.wallet.seedIndex,
});

const mapDispatchToProps = {
    setReceiveAddress,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Receive));
