import React from 'react';
import PropTypes from 'prop-types';
import MainSettings from './MainSettings';
import AdvancedSettings from './AdvancedSettings';
import AccountManagement from './AccountManagement';
import ViewSeed from './ViewSeed';
import ViewAddressesComponent from '../containers/ViewAddresses';
import ProofOfWork from '../containers/Pow';
import EditAccountNameComponent from './EditAccountName';
import DeleteAccount from './DeleteAccount';
import AddNewAccount from './AddNewAccount';
import UseExistingSeed from './UseExistingSeed';
import NodeSelection from './NodeSelection';
import AddCustomNode from './AddCustomNode';
import CurrencySelectionComponent from './CurrencySelection';
import ModeSelection from './ModeSelection';
import LanguageSelection from './LanguageSelection';
import ChangePassword from './ChangePassword';
import ManualSync from './ManualSync';
import ThemeCustomisation from './ThemeCustomisation';
import AdvancedThemeCustomisation from './AdvancedThemeCustomisation';
import SnapshotTransition from './SnapshotTransition';
import SecuritySettings from './SecuritySettings';

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
    advancedThemeCustomisation: AdvancedThemeCustomisation,
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
    component: PropTypes.oneOf(Object.keys(SETTINGS_COMPONENTS)).isRequired,
};

export default SettingsContent;
