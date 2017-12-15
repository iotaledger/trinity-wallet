import React from 'react';
// import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content } from './Template';

// import css from '../Layout/Main.css';

class Send extends React.PureComponent {
    static propTypes = {};

    render() {
        // eslint-disable-next-line
        const { t } = this.props;
        return (
            <Template>
                <Content>Send</Content>
            </Template>
        );
    }
}

const mapStateToProps = () => ({
    // fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    // addCustomNode,
    // setFullNode,
};

export default translate('send')(connect(mapStateToProps, mapDispatchToProps)(Send));
