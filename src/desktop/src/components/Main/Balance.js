import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content } from './Template';

import css from '../Layout/Main.css';

class Balance extends React.Component {
    static propTypes = {};

    render() {
        // const { t } = this.props;
        return (
            <Template>
                <Content>Test</Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    // fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
