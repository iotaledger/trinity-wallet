import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { runTask } from 'worker';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';
import Text from 'ui/components/input/Text.js';

import css from './receive.css';

class Receive extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        tempAccount: PropTypes.object.isRequired,
        seeds: PropTypes.object,
    };

    state = {
        message: '',
    };

    onGeneratePress = () => {
        const { seeds, account } = this.props;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const seedName = seedInfo.name;
        const accountInfo = account.accountInfo[seedName];

        runTask('generateNewAddress', [seedInfo.seed, seedName, accountInfo]);
    };

    render() {
        const { t, tempAccount: { receiveAddress, isGeneratingReceiveAddress } } = this.props;
        const { message } = this.state;

        const content =
            receiveAddress.length > 2 ? receiveAddress.match(/.{1,3}/g).join(' ') : new Array(27).join('ABC ');

        return (
            <div className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : null)}>
                <QRCode value={JSON.stringify({ address: receiveAddress, message })} size={200} />
                <p className={css.address}>
                    <Clipboard
                        text={content}
                        title={t('receive:addressCopied')}
                        success={t('receive:addressCopiedExplanation')}
                    />
                </p>
                <Text value={message} label="Custom message" onChange={(value) => this.setState({ message: value })} />
                <Button onClick={this.onGeneratePress} className="outline" loading={isGeneratingReceiveAddress}>
                    {t('receive:generateNewAddress')}
                </Button>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    account: state.account,
    seeds: state.seeds,
});

export default translate()(connect(mapStateToProps)(Receive));
