import React from 'react';
import PropTypes from 'prop-types';
import MainSettingsComponent from '../containers/MainSettings';
import AdvancedSettingsComponent from '../containers/AdvancedSettings';
import AccountManagement from '../containers/AccountManagement';
import ViewSeed from '../containers/ViewSeed';
import ViewAddressesComponent from '../containers/ViewAddresses';
import ProofOfWork from '../containers/Pow';
import AutoPromotion from '../containers/AutoPromotion';
import EditAccountNameComponent from '../containers/EditAccountName';
import DeleteAccount from '../containers/DeleteAccount';
import AddNewAccount from '../containers/AddNewAccount';
import UseExistingSeed from '../containers/UseExistingSeed';
import NodeSelection from '../containers/NodeSelection';
import AddCustomNode from '../containers/AddCustomNode';
import CurrencySelectionComponent from '../containers/CurrencySelection';
import ModeSelection from '../containers/ModeSelection';
import LanguageSelection from '../containers/LanguageSelection';
import ChangePassword from '../containers/ChangePassword';
import ManualSyncComponent from '../containers/ManualSync';
import ThemeCustomisation from '../containers/ThemeCustomisation';
import SnapshotTransition from '../containers/SnapshotTransition';
import SecuritySettings from '../containers/SecuritySettings';
import About from '../containers/About';

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
};

const SettingsContent = ({ component, ...props }) => {
    const EnhancedComponent = SETTINGS_COMPONENTS[component];

    return <EnhancedComponent {...props} />;
};

SettingsContent.propTypes = {
    /** Children component */
    component: PropTypes.oneOf(Object.keys(SETTINGS_COMPONENTS)).isRequired,
};

export default SettingsContent;
