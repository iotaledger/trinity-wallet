import React from 'react';
// import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content } from './Template';
// import Loading from '../UI/Loading';
// import css from '../Layout/Main.css';

class Balance extends React.Component {
    static propTypes = {
        // t: PropTypes.func.isRequired,
    };

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
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Balance));
