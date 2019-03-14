import includes from 'lodash/includes';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { getCurrencyData } from 'shared-modules/actions/settings';
import { setQrDenomination, setSendDenomination } from 'shared-modules/actions/ui';
import { IOTA_DENOMINATIONS } from 'shared-modules/libs/iota/utils';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import DropdownComponent from 'ui/components/Dropdown';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    innerContainer: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 5,
        justifyContent: 'flex-start',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
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

    renderBackOption() {
        const { theme, t } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.setSetting('mainSettings')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemLeft}>
                    <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                    <Text style={[styles.titleTextLeft, { color: theme.body.color }]}>{t('global:back')}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderSaveOption() {
        const { t, theme } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.getCurrencyData(this.dropdown.getSelected(), true)}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemRight}>
                    <Text style={[styles.titleTextRight, { color: theme.body.color }]}>{t('global:save')}</Text>
                    <Icon name="tick" size={width / 28} color={theme.body.color} />
                </View>
            </TouchableOpacity>
        );
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
                        <View style={{ flex: 1.2 }} />
                        <DropdownComponent
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            title={t('currency')}
                            options={availableCurrencies}
                            value={currency}
                            dropdownWidth={{ width: width / 2 }}
                            disableWhen={isFetchingCurrencyData}
                            background
                        />
                    </View>
                    {(isFetchingCurrencyData && (
                        <View style={styles.innerContainer}>
                            <ActivityIndicator
                                animating
                                style={styles.activityIndicator}
                                size="large"
                                color={theme.primary.color}
                            />
                        </View>
                    )) || <View style={styles.innerContainer} />}
                    <View style={styles.bottomContainer}>
                        {!isFetchingCurrencyData && this.renderBackOption()}
                        {!isFetchingCurrencyData && this.renderSaveOption()}
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
    connect(mapStateToProps, mapDispatchToProps)(CurrencySelection),
);
