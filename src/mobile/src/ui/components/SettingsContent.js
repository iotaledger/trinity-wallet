import map from 'lodash/map';
import find from 'lodash/find';
import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import i18next from 'shared-modules/libs/i18next.js';
import MainSettingsComponent from 'ui/views/wallet/MainSettings';
import AdvancedSettingsComponent from 'ui/views/wallet/AdvancedSettings';
import AccountManagement from 'ui/views/wallet/AccountManagement';
import ViewSeed from 'ui/views/wallet/ViewSeed';
import ViewAddressesComponent from 'ui/views/wallet/ViewAddresses';
import ProofOfWork from 'ui/views/wallet/Pow';
import AutoPromotion from 'ui/views/wallet/AutoPromotion';
import DeepLinking from 'ui/views/wallet/DeepLinking';
import EditAccountNameComponent from 'ui/views/wallet/EditAccountName';
import DeleteAccount from 'ui/views/wallet/DeleteAccount';
import AddNewAccount from 'ui/views/wallet/AddNewAccount';
import UseExistingSeed from 'ui/views/wallet/UseExistingSeed';
import NodeSelection from 'ui/views/wallet/NodeSelection';
import NodeSettingsComponent from 'ui/views/wallet/NodeSettings';
import AddCustomNodeComponent from 'ui/views/wallet/AddCustomNode';
import CurrencySelectionComponent from 'ui/views/wallet/CurrencySelection';
import ModeSelection from 'ui/views/wallet/ModeSelection';
import LanguageSelection from 'ui/views/wallet/LanguageSelection';
import ChangePassword from 'ui/views/wallet/ChangePassword';
import ManualSyncComponent from 'ui/views/wallet/ManualSync';
import ThemeCustomisation from 'ui/views/wallet/ThemeCustomisation';
import SnapshotTransitionComponent from 'ui/views/wallet/SnapshotTransition';
import SecuritySettings from 'ui/views/wallet/SecuritySettings';
import SeedVaultSettings from 'ui/views/wallet/SeedVaultSettings';
import StateExportComponent from 'ui/views/wallet/StateExport';
import About from 'ui/views/wallet/About';
import SettingsRow from 'ui/components/SettingsRow';
import SettingsSeparator from 'ui/components/SettingsSeparator';
import { Icon } from 'ui/theme/icons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

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
    nodeSettings: NodeSettingsComponent,
    nodeSelection: NodeSelection,
    addCustomNode: AddCustomNodeComponent,
    currencySelection: CurrencySelectionComponent,
    languageSelection: LanguageSelection,
    changePassword: ChangePassword,
    manualSync: ManualSyncComponent,
    themeCustomisation: ThemeCustomisation,
    snapshotTransition: SnapshotTransitionComponent,
    securitySettings: SecuritySettings,
    modeSelection: ModeSelection,
    pow: ProofOfWork,
    autoPromotion: AutoPromotion,
    deepLinking: DeepLinking,
    about: About,
    exportSeedVault: SeedVaultSettings,
    stateExport: StateExportComponent,
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
        alignItems: 'center'
    },
    backText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    footerItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    footerItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    footerTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    footerTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    dualFooterContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export const renderSettingsRows = (rows, theme) => {
    const { body } = theme;
    const dualFooter = find(rows, { name: 'dualFooter' });
    const backButton = find(rows, { name: 'back' });
    return (
        <View style={{ flex: 1 }}>
            {map(rows, (row, index) => {
                if (row.name === 'separator') {
                    return (
                        <SettingsSeparator inactive={row.inactive} color={theme.body.color} key={index}/>
                    );
                } else if (row.name !== 'back' && row.name !== 'dualFooter') {
                    return (
                        <SettingsRow
                            theme={theme}
                            name={row.name}
                            inactive={row.inactive}
                            onPress={row.function}
                            currentSetting={row.currentSetting}
                            icon={row.icon}
                            toggle={row.toggle}
                            dropdownOptions={row.dropdownOptions}
                            key={index}
                        />
                    );
                }
            })}
            {rows.length < 12 && <View style={{ flex: 12 - rows.length }} />}
            {backButton && (
                <View style={[ styles.itemContainer, backButton.inactive && { opacity: 0.35 } ]}>
                    <TouchableOpacity
                        onPress={backButton.function}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="chevronLeft" size={width / 28} color={body.color} />
                            <Text style={[styles.backText, { color: body.color }]}>{i18next.t('global:back')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
            {dualFooter && (
                <View style={[ styles.dualFooterContainer, { justifyContent: dualFooter.hideActionButton ? 'flex-start' : 'space-between'} ]}>
                    <TouchableOpacity
                        onPress={find(rows, { name: 'dualFooter' }).backFunction}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.footerItemLeft}>
                            <Icon name="chevronLeft" size={width / 28} color={body.color} />
                            <Text style={[styles.footerTextLeft, { color: body.color }]}>{i18next.t('global:back')}</Text>
                        </View>
                    </TouchableOpacity>
                    { dualFooter.hideActionButton === false &&
                    <TouchableOpacity
                        onPress={dualFooter.actionFunction}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.footerItemRight}>
                            <Text style={[styles.footerTextRight, { color: body.color }]}>{dualFooter.actionName}</Text>
                            <Icon name="tick" size={width / 28} color={body.color} />
                        </View>
                    </TouchableOpacity>
                    }
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
