import find from 'lodash/find';
import filter from 'lodash/filter';
import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import MainSettingsComponent from 'ui/views/wallet/MainSettings';
import AdvancedSettingsComponent from 'ui/views/wallet/AdvancedSettings';
import AccountManagement from 'ui/views/wallet/AccountManagement';
import ViewSeed from 'ui/views/wallet/ViewSeed';
import ViewAddressesComponent from 'ui/views/wallet/ViewAddresses';
import AutoPromotion from 'ui/views/wallet/AutoPromotion';
import DeepLinking from 'ui/views/wallet/DeepLinking';
import EditAccountNameComponent from 'ui/views/wallet/EditAccountName';
import DeleteAccount from 'ui/views/wallet/DeleteAccount';
import AddNewAccount from 'ui/views/wallet/AddNewAccount';
import UseExistingSeed from 'ui/views/wallet/UseExistingSeed';
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
import Help from 'ui/views/wallet/Help';
import SeedVaultSettings from 'ui/views/wallet/SeedVaultSettings';
import StateExportComponent from 'ui/views/wallet/StateExport';
import About from 'ui/views/wallet/About';
import SettingsRowsContainer from 'ui/components/SettingsRowsContainer';
import SettingsBackButton from 'ui/components/SettingsBackButton';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';

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
    addCustomNode: AddCustomNodeComponent,
    currencySelection: CurrencySelectionComponent,
    languageSelection: LanguageSelection,
    changePassword: ChangePassword,
    manualSync: ManualSyncComponent,
    themeCustomisation: ThemeCustomisation,
    snapshotTransition: SnapshotTransitionComponent,
    securitySettings: SecuritySettings,
    modeSelection: ModeSelection,
    autoPromotion: AutoPromotion,
    deepLinking: DeepLinking,
    about: About,
    exportSeedVault: SeedVaultSettings,
    stateExport: StateExportComponent,
    help: Help
};

const SettingsContent = ({ component, ...props }) => {
    const EnhancedComponent = SETTINGS_COMPONENTS[component];

    return <EnhancedComponent {...props} />;
};

export const renderSettingsRows = (rows, theme) => {
    const dualFooter = find(rows, { name: 'dualFooter' });
    const backButton = find(rows, { name: 'back' });
    const visibleRows = dualFooter || backButton ? 11 : 12;

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 12 }}>
                <View style={{ flex: visibleRows }}>
                    <SettingsRowsContainer
                        visibleRows={visibleRows}
                        rows={filter(rows, (row) => row.name !== 'dualFooter' && row.name !== 'back' && !row.hidden)}
                        theme={theme}
                    />
                </View>
                {(dualFooter || backButton) && <View style={{ flex: 1 }} />}
            </View>
            <View style={{ flex: 1 }}>
                {backButton && (
                    <SettingsBackButton
                        theme={theme}
                        backFunction={backButton.function}
                        inactive={backButton.inactive}
                    />
                )}
                {dualFooter && (
                    <SettingsDualFooter
                        theme={theme}
                        backFunction={dualFooter.backFunction}
                        hideActionButton={dualFooter.hideActionButton}
                        actionName={dualFooter.actionName}
                        actionButtonLoading={dualFooter.actionButtonLoading}
                        actionFunction={dualFooter.actionFunction}
                    />
                )}
            </View>
        </View>
    );
};

SettingsContent.propTypes = {
    /** Children component */
    component: PropTypes.oneOf(Object.keys(SETTINGS_COMPONENTS)).isRequired,
};

export default SettingsContent;
