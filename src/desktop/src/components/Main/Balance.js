import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content } from './Template';
// import Loading from '../UI/Loading';
// import css from '../Layout/Main.css';

import { getAccountInfoAsync, getNewAddressAsync } from 'actions/seeds';

class Balance extends React.Component {
    static propTypes = {
        getAccountInfoAsync: PropTypes.func,
        getNewAddressAsync: PropTypes.func,
        seed: PropTypes.shape({
            name: PropTypes.string,
            seed: PropTypes.string,
            addresses: PropTypes.array,
        }).isRequired,
        // t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        // this.props.getAccountInfoNewSeedAsync(seed);
    }

    getBalance = () => {
        const { getAccountInfoAsync, seed } = this.props;
        getAccountInfoAsync(seed.seed);
    };

    getNewAddress = () => {
        const { getNewAddressAsync, seed } = this.props;
        getNewAddressAsync(seed.seed);
    };

    render() {
        // const { t } = this.props;
        return (
            <Template>
                <Content>
                    {/* <Loading /> */}
                    test
                    <button onClick={this.getNewAddress}>New Address</button>
                    <button onClick={this.getBalance}>Get Balance</button>
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    getAccountInfoAsync,
    getNewAddressAsync,
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
