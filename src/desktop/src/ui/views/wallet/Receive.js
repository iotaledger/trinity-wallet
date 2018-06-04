import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qr.js/lib/QRCode';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';
import { runTask } from 'worker';

import { setReceiveAddress } from 'actions/wallet';
import { generateAlert } from 'actions/alerts';

import { getSeed } from 'libs/crypto';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Clipboard from 'ui/components/Clipboard';
import Text from 'ui/components/input/Text.js';

import css from './receive.scss';

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

    componentDidMount() {
        if (this.props.receiveAddress) {
            this.props.setReceiveAddress(' ');
        }
    }

    componentWillUnmount() {
        if (this.props.receiveAddress) {
            this.props.setReceiveAddress(' ');
        }
    }

    onGeneratePress = async () => {
        const { password, accountName, account, isSyncing, isTransitioning, generateAlert, t } = this.props;

        if (isSyncing || isTransitioning) {
            return generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }

        const seed = await getSeed(password, accountName, true);

        runTask('generateNewAddress', [seed, accountName, account]);
    };

    render() {
        const { t, receiveAddress, isGeneratingReceiveAddress } = this.props;
        const { message } = this.state;

        const qr = new QRCode(-1, 1);

        qr.addData(JSON.stringify({ address: receiveAddress, message: message }));
        qr.make();

        const cells = qr.modules;

        return (
            <div className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : css.full)}>
                <div className={isGeneratingReceiveAddress ? css.loading : null}>
                    <svg width="150" height="150" viewBox={`0 0 ${cells.length} ${cells.length}`}>
                        {cells.map((row, rowIndex) => {
                            return row.map((cell, cellIndex) => (
                                <rect
                                    height={1}
                                    key={cellIndex}
                                    style={{ fill: cell ? '#000000' : 'none' }}
                                    width={1}
                                    x={cellIndex}
                                    y={rowIndex}
                                />
                            ));
                        })}
                    </svg>
                    {receiveAddress.length < 2 ? (
                        <Button className="icon" disabled={receiveAddress.length > 2} onClick={this.onGeneratePress}>
                            <Icon icon="sync" size={32} />
                            {t('receive:generateNewAddress')}
                        </Button>
                    ) : (
                        <p>
                            <Clipboard
                                text={receiveAddress}
                                title={t('receive:addressCopied')}
                                success={t('receive:addressCopiedExplanation')}
                            >
                                {receiveAddress}
                            </Clipboard>
                        </p>
                    )}
                </div>
                <div>
                    <Text
                        value={message}
                        label={t('receive:message')}
                        onChange={(value) => this.setState({ message: value })}
                    />
                    <footer>
                        <Button to="/wallet/" variant="secondary" className="outlineSmall">
                            {t('close')}
                        </Button>
                        <Clipboard
                            text={receiveAddress}
                            title={t('receive:addressCopied')}
                            success={t('receive:addressCopiedExplanation')}
                        >
                            <Button className="small" onClick={() => {}}>
                                {t('receive:copyAddress')}
                            </Button>
                        </Clipboard>
                    </footer>
                </div>
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
});

const mapDispatchToProps = {
    setReceiveAddress,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Receive));
