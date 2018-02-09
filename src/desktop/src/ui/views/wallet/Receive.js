import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { runTask } from 'worker';
import { generateNewAddressRequest, generateNewAddressError, generateNewAddressSuccess } from 'actions/tempAccount';
import List from 'ui/components/List';
import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';

import css from './receive.css';

class Receive extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        tempAccount: PropTypes.object.isRequired,
        seeds: PropTypes.object,
    };

    state = {};

    onGeneratePress = () => {
        const { seeds, account } = this.props;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const seedName = seedInfo.name;
        const accountInfo = account.accountInfo[seedName];

        runTask('generateNewAddress', [seedInfo.seed, seedName, accountInfo.addresses]);
    };

    render() {
        const { t, tempAccount: { receiveAddress, isGeneratingReceiveAddress }, account, seeds } = this.props;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        return (
            <main>
                <section className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : null)}>
                    <p className={css.address}>
                        <Clipboard
                            text={receiveAddress}
                            title={t('receive:addressCopied')}
                            success={t('receive:addressCopiedExplanation')}
                        />
                    </p>
                    <QRCode value={receiveAddress} size={220} />
                    <Button onClick={this.onGeneratePress} loading={isGeneratingReceiveAddress}>
                        {t('receive:generateNewAddress')}
                    </Button>
                </section>
                <section>
                    <List
                        filter="received"
                        transfers={accountInfo.transfers.length ? accountInfo.transfers : []}
                        addresses={Object.keys(accountInfo.addresses)}
                    />
                </section>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    account: state.account,
    seeds: state.seeds,
});

const mapDispatchToProps = {
    generateNewAddressRequest,
    generateNewAddressError,
    generateNewAddressSuccess,
};

export default translate('receive')(connect(mapStateToProps, mapDispatchToProps)(Receive));
