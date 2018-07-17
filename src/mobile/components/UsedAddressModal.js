import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingTop: height / 20,
        paddingBottom: height / 25,
        width: width / 1.15,
        paddingHorizontal: width / 20,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    regularText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
    },
    boldText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        textAlign: 'justify',
    },
});

class UsedAddressModal extends PureComponent {
    static propTypes = {
        /** Closes acive modal */
        hideModal: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Content text color */
        textColor: PropTypes.object.isRequired,
        /** Content border color */
        borderColor: PropTypes.object.isRequired,
        /** Theme body */
        body: PropTypes.object.isRequired,
        /** Theme bar */
        bar: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('UsedAddressModal');
    }

    render() {
        const { t, body, bar, textColor, borderColor } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.hideModal()} style={styles.modalContainer}>
                <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: body.bg }}>
                    <View style={[styles.modalContent, borderColor]}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.regularText, textColor]}>{t('cantSpendFullBalanceQuestion')}</Text>
                            <Text style={[styles.boldText, textColor, { paddingTop: height / 25 }]}>
                                {t('spentAddressExplanation')}
                            </Text>
                            <Text style={[styles.boldText, textColor, { paddingTop: height / 60 }]}>
                                {t('discordInformation')}
                            </Text>
                        </View>
                    </View>
                </View>
                <StatefulDropdownAlert backgroundColor={bar.bg} />
            </TouchableOpacity>
        );
    }
}

export default translate(['usedAddressModal', 'global'])(UsedAddressModal);
