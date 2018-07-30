import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';
import { runTask } from 'worker';

import { generateAlert } from 'actions/alerts';
import { selectLatestAddressFromAccountFactory } from 'iota-wallet-shared-modules/selectors/accounts';

import { byteToChar, getSeed, createRandomSeed } from 'libs/crypto';
import { ADDRESS_LENGTH } from 'libs/iota/utils';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Clipboard from 'ui/components/Clipboard';
import Text from 'ui/components/input/Text.js';
import QR from 'ui/components/QR';

import css from './receive.scss';

/**
 * Send transactions component
 */
class Receive extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        receiveAddress: PropTypes.string.isRequired,
        /** @ignore */
        password: PropTypes.object,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        message: '',
        scramble: new Array(ADDRESS_LENGTH).fill(0),
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isGeneratingReceiveAddress && !nextProps.isGeneratingReceiveAddress) {
            this.frame = 0;

            this.setState({
                scramble: createRandomSeed(ADDRESS_LENGTH),
            });

            this.unscramble();
        }
    }

    componentWillUnmount() {
        this.frame = -1;
    }

    onGeneratePress = async () => {
        const { password, accountName, account, isSyncing, isTransitioning, generateAlert, t } = this.props;

        if (isSyncing || isTransitioning) {
            return generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }

        const seed = await getSeed(password, accountName, true);

        runTask('generateNewAddress', [seed, accountName, account]);
    };

    unscramble() {
        const { scramble } = this.state;

        if (this.frame < 0) {
            return;
        }

        const scrambleNew = [];
        let sum = -1;

        if (this.frame > 3) {
            sum = 0;

            for (let i = 0; i < scramble.length; i++) {
                sum += scramble[i];
                scrambleNew.push(Math.max(0, scramble[i] - 15));
            }

            this.setState({
                scramble: scrambleNew,
            });

            this.frame = 0;
        }

        this.frame++;

        if (sum !== 0) {
            requestAnimationFrame(this.unscramble.bind(this));
        }
    }

    render() {
        const { t, receiveAddress, isGeneratingReceiveAddress } = this.props;
        const { message, scramble } = this.state;

        return (
            <div className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : css.full)}>
                <div className={isGeneratingReceiveAddress ? css.loading : null}>
                    <QR data={JSON.stringify({ address: receiveAddress, message: message })} />
                    <p>
                        <Clipboard
                            text={receiveAddress}
                            title={t('receive:addressCopied')}
                            success={t('receive:addressCopiedExplanation')}
                        >
                            {receiveAddress.split('').map((char, index) => {
                                const scrambleChar = scramble[index] > 0 ? byteToChar(scramble[index]) : null;
                                return <React.Fragment key={`char-${index}`}>{scrambleChar || char}</React.Fragment>;
                            })}
                        </Clipboard>
                    </p>
                </div>
                <div>
                    <Button className="icon" loading={isGeneratingReceiveAddress} onClick={this.onGeneratePress}>
                        <Icon icon="sync" size={32} />
                        {t('receive:generateNewAddress')}
                    </Button>
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
    receiveAddress: selectLatestAddressFromAccountFactory(state),
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSyncing: state.ui.isSyncing,
    isTransitioning: state.ui.isTransitioning,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(Receive));
