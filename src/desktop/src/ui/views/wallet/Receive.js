import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';
import { runTask } from 'worker';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import Text from 'ui/components/input/Text.js';

import css from './receive.css';

class Receive extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        accountName: PropTypes.string.isRequired,
        wallet: PropTypes.object.isRequired,
        seed: PropTypes.string,
    };

    state = {
        message: '',
    };

    onGeneratePress = () => {
        const { seed, accountName, account } = this.props;
        runTask('generateNewAddress', [seed, accountName, account]);
    };

    render() {
        const { t, wallet: { receiveAddress, isGeneratingReceiveAddress } } = this.props;
        const { message } = this.state;

        const content =
            receiveAddress.length > 2 ? receiveAddress.match(/.{1,3}/g).join(' ') : new Array(27).join('ABC ');

        return (
            <div className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : null)}>
                <QRCode value={JSON.stringify({ address: receiveAddress, message })} size={200} />
                <p className={css.address}>
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
    wallet: state.wallet,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
    seed: state.seeds.seeds[state.wallet.seedIndex],
});

export default connect(mapStateToProps)(translate()(Receive));
