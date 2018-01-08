import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
} from 'actions/tempAccount';
import Template, { Content } from 'components/Main/Template';
import HistoryList from 'components/UI/HistoryList';
import css from 'components/Main/Receive.css';
import Button from 'components/UI/Button';
import Clipboard from 'components/UI/Clipboard';

class Receive extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        tempAccount: PropTypes.object.isRequired,
        seeds: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        generateNewAddressRequest: PropTypes.func.isRequired,
        generateNewAddress: PropTypes.func.isRequired,
    };

    state = {};

    onGeneratePress = () => {
        const { generateNewAddressRequest, generateNewAddress, seeds, account } = this.props;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        generateNewAddressRequest();
        generateNewAddress(seedInfo.seed, seedInfo.name, accountInfo.addresses);
    };

    render() {
        const { t, tempAccount: { receiveAddress }, account, seeds } = this.props;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        return (
            <Template>
                <Content>
                    <section className={classNames(css.receive, receiveAddress.length < 2 ? css.empty : null)}>
                        <p className={css.address}>
                            <Clipboard
                                text={receiveAddress}
                                title={t('receive:addressCopied')}
                                success={t('receive:addressCopiedExplanation')}
                            />
                        </p>
                        <QRCode value={receiveAddress} size={220} />
                        <Button onClick={this.onGeneratePress}>{t('receive:generateNewAddress')}</Button>
                    </section>
                    <section>
                        <HistoryList
                            filter="received"
                            transfers={accountInfo.transfers.length ? accountInfo.transfers : []}
                            addresses={Object.keys(accountInfo.addresses)}
                        />
                    </section>
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    seeds: state.seeds,
});

const mapDispatchToProps = {
    generateNewAddress,
    setReceiveAddress,
    generateNewAddressRequest,
    generateNewAddressError,
};

export default translate('receive')(connect(mapStateToProps, mapDispatchToProps)(Receive));
