import map from 'lodash/map';
import some from 'lodash/some';
import find from 'lodash/find';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import i18next from 'i18next.js';
import MainSettingsComponent from 'ui/views/MainSettings';
import AdvancedSettingsComponent from 'ui/views/AdvancedSettings';
import AccountManagement from 'ui/views/AccountManagement';
import ViewSeed from 'ui/views/ViewSeed';
import ViewAddressesComponent from 'ui/views/ViewAddresses';
import ProofOfWork from 'ui/views/Pow';
import AutoPromotion from 'ui/views/AutoPromotion';
import EditAccountNameComponent from 'ui/views/EditAccountName';
import DeleteAccount from 'ui/views/DeleteAccount';
import AddNewAccount from 'ui/views/AddNewAccount';
import UseExistingSeed from 'ui/views/UseExistingSeed';
import NodeSelection from 'ui/views/NodeSelection';
import AddCustomNode from 'ui/views/AddCustomNode';
import CurrencySelectionComponent from 'ui/views/CurrencySelection';
import ModeSelection from 'ui/views/ModeSelection';
import LanguageSelection from 'ui/views/LanguageSelection';
import ChangePassword from 'ui/views/ChangePassword';
import ManualSyncComponent from 'ui/views/ManualSync';
import ThemeCustomisation from 'ui/views/ThemeCustomisation';
import SnapshotTransition from 'ui/views/SnapshotTransition';
import SecuritySettings from 'ui/views/SecuritySettings';
import SeedVaultSettings from 'ui/views/SeedVaultSettings';
import About from 'ui/views/About';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import GENERAL from 'ui/theme/general';

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
