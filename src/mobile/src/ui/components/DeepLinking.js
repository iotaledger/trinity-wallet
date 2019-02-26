import React, { Component } from 'react';
import { Linking } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { initiateDeepLinkRequest } from 'shared-modules/actions/wallet';
import { parseAddress } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';

export default () => (C) => {
    class WithDeepLinking extends Component {
        componentWillMount() {
            this.deepLinkSub = Linking.addEventListener('url', this.setDeepUrl);
        }

        /**
         * Prefills transactional information on deep link
         * @param {Object} data
         */
        setDeepUrl(data) {
            const { t, generateAlert } = this.props;
            const parsedData = parseAddress(data.url);
            if (parsedData) {
                this.props.initiateDeepLinkRequest(
                    parsedData.amount.toString() || '0',
                    parsedData.address,
                    parsedData.message || null,
                );
                this.props.changeHomeScreenRoute('send');
            } else {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
            }
        }

        render() {
            return <C {...this.props} />;
        }
    }

    WithDeepLinking.propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        initiateDeepLinkRequest: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
    };

    const mapDispatchToProps = {
        initiateDeepLinkRequest,
        generateAlert,
        changeHomeScreenRoute,
    };

    return withNamespaces(['global'])(connect(null, mapDispatchToProps)(WithDeepLinking));
};
