import React from 'react';
import PropTypes from 'prop-types';
import MainSettings from '../containers/MainSettings';
import AdvancedSettings from '../containers/AdvancedSettings';
import AccountManagement from '../containers/AccountManagement';
import ViewSeed from '../containers/ViewSeed';
import ViewAddressesComponent from '../containers/ViewAddresses';
import ProofOfWork from '../containers/Pow';
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
import ManualSync from '../containers/ManualSync';
import ThemeCustomisation from '../containers/ThemeCustomisation';
import SnapshotTransition from '../containers/SnapshotTransition';
import SecuritySettings from '../containers/SecuritySettings';

const SETTINGS_COMPONENTS = {
    mainSettings: MainSettings,
    advancedSettings: AdvancedSettings,
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
    manualSync: ManualSync,
    themeCustomisation: ThemeCustomisation,
    snapshotTransition: SnapshotTransition,
    securitySettings: SecuritySettings,
    modeSelection: ModeSelection,
    pow: ProofOfWork,
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
