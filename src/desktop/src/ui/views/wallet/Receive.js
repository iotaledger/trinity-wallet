import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/account';
import { runTask } from 'worker';
import { setReceiveAddress } from 'actions/tempAccount';

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
        /** Current seed value */
        seed: PropTypes.string,
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

    onGeneratePress = () => {
        const { seed, accountName, account } = this.props;
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
    receiveAddress: state.tempAccount.receiveAddress,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    seed: state.seeds.seeds[state.tempAccount.seedIndex],
});

const mapDispatchToProps = {
    setReceiveAddress,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Receive));
