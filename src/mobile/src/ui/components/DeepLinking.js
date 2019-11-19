import get from 'lodash/get';
import React, { Component } from 'react';
import { Linking } from 'react-native';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { initiateDeepLinkRequest, setDeepLinkContent, setSetting } from 'shared-modules/actions/wallet';
import { parseAddress, ADDRESS_LENGTH } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getActiveTransaction } from 'shared-modules/selectors/exchanges/MoonPay';
import { fetchTransactionDetails } from 'shared-modules/actions/exchanges/MoonPay';
import { changeHomeScreenRoute } from 'shared-modules/actions/home';
import { MOONPAY_RETURN_URL } from 'shared-modules/exchanges/MoonPay';
import { isAndroid } from 'libs/device';
import navigator from 'libs/navigation';

export default () => (C) => {
    class WithDeepLinking extends Component {
        constructor() {
            super();
            this.setDeepUrl = this.setDeepUrl.bind(this);
        }

        componentDidMount() {
            Linking.addEventListener('url', this.setDeepUrl);
            if (isAndroid) {
                Linking.getInitialURL().then((url) => {
                    if (url) {
                        this.setDeepUrl(url);
                    }
                });
            }
        }

        componentWillUnmount() {
            Linking.removeEventListener('url', this.setDeepUrl);
        }

        /**
         * Prefills transactional information on deep link
         * @param {Object} data
         */
        setDeepUrl(data) {
            const { activeTransaction, t, generateAlert, deepLinking } = this.props;
            if (get(data, 'url').includes(MOONPAY_RETURN_URL)) {
                this.props.fetchTransactionDetails(get(activeTransaction, 'id'));
                return navigator.setStackRoot('reviewPurchase');
            }
            this.props.initiateDeepLinkRequest();
            if (!deepLinking) {
                this.navigateToSettings();
                return generateAlert('info', t('deepLink:deepLinkingInfoTitle'), t('deepLink:deepLinkingInfoMessage'));
            }
            this.props.changeHomeScreenRoute('send');
            const parsedData = parseAddress(data.url || data);
            if (parsedData) {
                this.props.setDeepLinkContent(
                    parsedData.amount.toString() || '0',
                    parsedData.address,
                    parsedData.message || null,
                );
            } else {
                generateAlert(
                    'error',
                    t('send:invalidAddress'),
                    t('send:invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }),
                );
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
        setDeepLinkContent: PropTypes.func.isRequired,
        /** @ignore */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** @ignore */
        fetchTransactionDetails: PropTypes.func.isRequired,
        /** @ignore */
        deepLinking: PropTypes.bool.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
    };

    const mapStateToProps = (state) => ({
        deepLinking: state.settings.deepLinking,
        activeTransaction: getActiveTransaction(state),
    });

    const mapDispatchToProps = {
        initiateDeepLinkRequest,
        setDeepLinkContent,
        generateAlert,
        changeHomeScreenRoute,
        setSetting,
        fetchTransactionDetails,
    };

    return withTranslation(['global'])(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(WithDeepLinking),
    );
};
