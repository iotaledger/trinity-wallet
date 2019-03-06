import React, { Component } from 'react';
import { Linking } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { initiateDeepLinkRequest, setSetting } from 'shared-modules/actions/wallet';
import { parseAddress } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';

export default () => (C) => {
    class WithDeepLinking extends Component {
        constructor() {
            super();
            this.setDeepUrl = this.setDeepUrl.bind(this);
        }
        componentWillMount() {
            this.deepLinkSub = Linking.addEventListener('url', this.setDeepUrl);
        }

        /**
         * Prefills transactional information on deep link
         * @param {Object} data
         */
        setDeepUrl(data) {
            const { t, generateAlert, deepLinking } = this.props;

            if (!deepLinking) {
                return this.navigateToSettings();
            }
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

        /**
         * Navigates to deep linking settings
         */
        navigateToSettings() {
            this.props.changeHomeScreenRoute('settings');
            this.props.setSetting('deepLinking');
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
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        initiateDeepLinkRequest: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        deepLinking: PropTypes.bool.isRequired,
    };

    const mapStateToProps = (state) => ({
        deepLinking: state.settings.deepLinking,
    });

    const mapDispatchToProps = {
        initiateDeepLinkRequest,
        generateAlert,
        changeHomeScreenRoute,
        setSetting,
    };

    return withNamespaces(['global'])(connect(mapStateToProps, mapDispatchToProps)(WithDeepLinking));
};
