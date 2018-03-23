import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { getCurrencyData } from 'iota-wallet-shared-modules/actions/settings';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { translate } from 'react-i18next';
import { width, height } from '../utils/dimensions';
import DropdownComponent from '../containers/Dropdown';
import { Icon } from '../theme/icons.js';

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
        flex: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 4,
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
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
    titleTextRight: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

export class CurrencySelection extends Component {
    static propTypes = {
        isFetchingCurrencyData: PropTypes.bool.isRequired,
        currency: PropTypes.string.isRequired,
        availableCurrencies: PropTypes.array.isRequired,
        setSetting: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        primaryColor: PropTypes.string.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        bodyColor: PropTypes.string.isRequired,
    };

    componentWillReceiveProps(newProps) {
        const props = this.props;

        const wasFetchingCurrencyData = props.isFetchingCurrencyData && !newProps.isFetchingCurrencyData;
        const shouldNavigateBack = wasFetchingCurrencyData && !newProps.hasErrorFetchingCurrencyData;

        if (shouldNavigateBack) {
            props.setSetting('mainSettings');
        }
    }

    getNewlySelectedValue() {
        if (this.dropdown) {
            return this.dropdown.getSelected();
        }

        return this.props.currency; // Just return currency selected in the store as a fallback
    }

    renderBackOption() {
        const { bodyColor, t } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.setSetting('mainSettings')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemLeft}>
                    <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                    <Text style={[styles.titleTextLeft, { color: bodyColor }]}>{t('global:backLowercase')}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderSaveOption() {
        const { t, bodyColor } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.getCurrencyData(this.dropdown.getSelected(), true)}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemRight}>
                    <Text style={[styles.titleTextRight, { color: bodyColor }]}>{t('global:save')}</Text>
                    <Icon name="tick" size={width / 28} color={bodyColor} />
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        const { currency, availableCurrencies, t, primaryColor, isFetchingCurrencyData } = this.props;

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
                            defaultOption={currency}
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
                                color={primaryColor}
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
    availableCurrencies: state.settings.availableCurrencies,
    isFetchingCurrencyData: state.ui.isFetchingCurrencyData,
    hasErrorFetchingCurrencyData: state.ui.hasErrorFetchingCurrencyData,
    bodyColor: state.settings.theme.body.color,
    primaryColor: state.settings.theme.primary.color,
});

const mapDispatchToProps = {
    getCurrencyData,
    setSetting,
};

export default translate(['currencySelection', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CurrencySelection),
);
