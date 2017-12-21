import React from 'react';
// import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getAccountInfoAsync, getNewAddressAsync } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content } from './Template';
// import Loading from '../UI/Loading';
// import css from '../Layout/Main.css';

class Settings extends React.Component {
    static propTypes = {};

    componentDidMount() {
        // this.props.getAccountInfoNewSeedAsync(seed);
    }

    render() {
        // const { t } = this.props;
        return (
            <Template>
                <Content>{/*  */}</Content>
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

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Settings));
