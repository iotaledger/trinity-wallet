import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content } from './Template';
// import Loading from '../UI/Loading';
// import css from '../Layout/Main.css';

import { getAccountInfoNewSeedAsync } from 'actions/account';

class Balance extends React.Component {
    static propTypes = {
        getAccountInfoNewSeedAsync: PropTypes.func,
        // t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const seed = 'QAPGQWR9USSAWPAKUDDLWCXQHIVTPYQPOYLATEYHUNAVDNDQSUPFDBJZRMSCNRL9VCALJOLLXTWAUBLDK';
        this.props.getAccountInfoNewSeedAsync(seed);
    }

    render() {
        // const { t } = this.props;
        return (
            <Template>
                <Content>
                    {/* <Loading /> */}
                    test
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    // fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    getAccountInfoNewSeedAsync,
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
