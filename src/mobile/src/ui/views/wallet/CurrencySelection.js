import includes from 'lodash/includes';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { getCurrencyData } from 'shared-modules/actions/settings';
import { setQrDenomination, setSendDenomination } from 'shared-modules/actions/ui';
import { IOTA_DENOMINATIONS } from 'shared-modules/libs/iota/utils';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { withNamespaces } from 'react-i18next';
import { width } from 'libs/dimensions';
import DropdownComponent from 'ui/components/Dropdown';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
    },
    innerContainer: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 5,
        justifyContent: 'center',
    },
});

/** Currency Selection component */
export class CurrencySelection extends Component {
    static propTypes = {
        /** @ignore */
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        sendDenomination: PropTypes.string.isRequired,
        /** @ignore */
        qrDenomination: PropTypes.string.isRequired,
        /** @ignore */
        availableCurrencies: PropTypes.array.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        getCurrencyData: PropTypes.func.isRequired,
        /** @ignore */
        setQrDenomination: PropTypes.func.isRequired,
        /** @ignore */
        setSendDenomination: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            currency: props.currency,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('CurrencySelection');
    }

    componentWillReceiveProps(newProps) {
        const props = this.props;

        const wasFetchingCurrencyData = props.isFetchingCurrencyData && !newProps.isFetchingCurrencyData;
        const hasFetchedCurrencyData = wasFetchingCurrencyData && !newProps.hasErrorFetchingCurrencyData;

        if (hasFetchedCurrencyData) {
            // Navigate to main settings
            props.setSetting('mainSettings');

            if (!includes(IOTA_DENOMINATIONS, props.qrDenomination)) {
                props.setQrDenomination(newProps.currency);
            }

            if (!includes(IOTA_DENOMINATIONS, props.sendDenomination)) {
                props.setSendDenomination(newProps.currency);
            }
        }
    }

    render() {
        const { currency, availableCurrencies, t, theme, isFetchingCurrencyData } = this.props;
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (this.dropdown) {
                        this.dropdown.closeDropdown();
                    }
                }}
            >
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('currency')}
                            options={availableCurrencies}
                            value={currency}
                            dropdownWidth={{ width: width / 2 }}
                            disableWhen={isFetchingCurrencyData}
                            saveSelection={(currency) => this.setState({ currency })}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            hideActionButton={this.state.currency === currency}
                            backFunction={() => this.props.setSetting('mainSettings')}
                            actionFunction={() => this.props.getCurrencyData(this.state.currency, true)}
                            actionName={t('global:save')}
                            actionButtonLoading={isFetchingCurrencyData}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currency: state.settings.currency,
    sendDenomination: state.ui.sendDenomination,
    qrDenomination: state.ui.qrDenomination,
    availableCurrencies: state.settings.availableCurrencies,
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    getCurrencyData,
    setSetting,
    setQrDenomination,
    setSendDenomination,
};

export default withNamespaces(['currencySelection', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(CurrencySelection),
);
