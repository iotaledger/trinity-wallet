import map from 'lodash/map';
import some from 'lodash/some';
import find from 'lodash/find';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import i18next from 'i18next';
import MainSettingsComponent from 'mobile/src/ui/views/wallet/MainSettings';
import AdvancedSettingsComponent from 'mobile/src/ui/views/wallet/AdvancedSettings';
import AccountManagement from 'mobile/src/ui/views/wallet/AccountManagement';
import ViewSeed from 'mobile/src/ui/views/wallet/ViewSeed';
import ViewAddressesComponent from 'mobile/src/ui/views/wallet/ViewAddresses';
import ProofOfWork from 'mobile/src/ui/views/wallet/Pow';
import AutoPromotion from 'mobile/src/ui/views/wallet/AutoPromotion';
import EditAccountNameComponent from 'mobile/src/ui/views/wallet/EditAccountName';
import DeleteAccount from 'mobile/src/ui/views/wallet/DeleteAccount';
import AddNewAccount from 'mobile/src/ui/views/wallet/AddNewAccount';
import UseExistingSeed from 'mobile/src/ui/views/wallet/UseExistingSeed';
import NodeSelection from 'mobile/src/ui/views/wallet/NodeSelection';
import AddCustomNode from 'mobile/src/ui/views/wallet/AddCustomNode';
import CurrencySelectionComponent from 'mobile/src/ui/views/wallet/CurrencySelection';
import ModeSelection from 'mobile/src/ui/views/wallet/ModeSelection';
import LanguageSelection from 'mobile/src/ui/views/wallet/LanguageSelection';
import ChangePassword from 'mobile/src/ui/views/wallet/ChangePassword';
import ManualSyncComponent from 'mobile/src/ui/views/wallet/ManualSync';
import ThemeCustomisation from 'mobile/src/ui/views/wallet/ThemeCustomisation';
import SnapshotTransition from 'mobile/src/ui/views/wallet/SnapshotTransition';
import SecuritySettings from 'mobile/src/ui/views/wallet/SecuritySettings';
import SeedVaultSettings from 'mobile/src/ui/views/wallet/SeedVaultSettings';
import About from 'mobile/src/ui/views/wallet/About';
import { Icon } from 'mobile/src/ui/theme/icons';
import { width, height } from 'mobile/src/libs/dimensions';
import GENERAL from 'mobile/src/ui/theme/general';

const SETTINGS_COMPONENTS = {
    mainSettings: MainSettingsComponent,
    advancedSettings: AdvancedSettingsComponent,
    accountManagement: AccountManagement,
    viewSeed: ViewSeed,
    viewAddresses: ViewAddressesComponent,
    editAccountName: EditAccountNameComponent,
    deleteAccount: DeleteAccount,
    addNewAccount: AddNewAccount,
    addExistingSeed: UseExistingSeed,
    nodeSelection: NodeSelection,
    addCustomNode: AddCustomNode,
    currencySelection: CurrencySelectionComponent,
    languageSelection: LanguageSelection,
    changePassword: ChangePassword,
    manualSync: ManualSyncComponent,
    themeCustomisation: ThemeCustomisation,
    snapshotTransition: SnapshotTransition,
    securitySettings: SecuritySettings,
    modeSelection: ModeSelection,
    pow: ProofOfWork,
    autoPromotion: AutoPromotion,
    about: About,
    exportSeedVault: SeedVaultSettings,
};

const SettingsContent = ({ component, ...props }) => {
    const EnhancedComponent = SETTINGS_COMPONENTS[component];

    return <EnhancedComponent {...props} />;
};

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    separator: {
        borderBottomWidth: 0.25,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    settingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    backText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
});

export const renderSettingsRows = (rows, theme) => {
    const textColor = { color: theme.body.color };
    const bodyColor = theme.body.color;
    const borderBottomColor = { borderBottomColor: theme.body.color };
    return (
        <View style={{ flex: 1 }}>
            {map(rows, (row, index) => {
                if (row.name === 'separator') {
                    return (
                        <View style={styles.separatorContainer} key={index}>
                            <View style={[styles.separator, borderBottomColor]} />
                        </View>
                    );
                } else if (row.name !== 'back') {
                    return (
                        <View style={styles.itemContainer} key={index}>
                            <TouchableOpacity
                                onPress={row.function}
                                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            >
                                <View style={styles.item}>
                                    <Icon name={row.icon} size={width / 22} color={bodyColor} />
                                    <View style={styles.content}>
                                        <Text style={[styles.titleText, textColor]}>{row.name}</Text>
                                        {row.currentSetting && (
                                            <Text numberOfLines={1} style={[styles.settingText, textColor]}>
                                                {row.currentSetting}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    );
                }
            })}
            {rows.length < 12 && <View style={{ flex: 12 - rows.length }} />}
            {some(rows, { name: 'back' }) && (
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={find(rows, { name: 'back' }).function}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                            <Text style={[styles.backText, textColor]}>{i18next.t('global:back')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

SettingsContent.propTypes = {
    /** Children component */
    component: PropTypes.oneOf(Object.keys(SETTINGS_COMPONENTS)).isRequired,
};

export default SettingsContent;
