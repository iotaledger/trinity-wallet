import React from 'react';
import PropTypes from 'prop-types';
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
import css from 'components/Main/Receive.css';
import Button from 'components/UI/Button';

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
        const { t, tempAccount: { receiveAddress } } = this.props;

        return (
            <Template>
                <Content>
                    <section className={css.receive}>
                        {receiveAddress.length ? <p className={css.address}>{receiveAddress}</p> : null}
                        <QRCode value={receiveAddress} size={220} />
                        <Button onClick={this.onGeneratePress}>{t('receive:generateNewAddress')}</Button>
                    </section>
                    <section />
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
