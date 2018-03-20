import React from 'react';
import PropTypes from 'prop-types';
import MainSettings from './mainSettings';
import AdvancedSettings from './advancedSettings';
import AccountManagement from './accountManagement';
import ViewSeed from './viewSeed';
import ViewAddressesComponent from '../containers/viewAddresses';
import ProofOfWork from '../containers/pow';
import EditAccountNameComponent from './editAccountName';
import DeleteAccount from './deleteAccount';
import AddNewAccount from './addNewAccount';
import UseExistingSeed from './useExistingSeed';
import NodeSelection from './nodeSelection';
import AddCustomNode from './addCustomNode';
import CurrencySelectionComponent from './currencySelection';
import ModeSelection from './modeSelection';
import LanguageSelection from './languageSelection';
import ChangePassword from './changePassword';
import ManualSync from './manualSync';
import ThemeCustomisation from './themeCustomisation';
import AdvancedThemeCustomisation from './advancedThemeCustomisation';
import SnapshotTransition from './snapshotTransition';
import SecuritySettings from './securitySettings';

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
    component: PropTypes.oneOf(Object.keys(SETTINGS_COMPONENTS)).isRequired, // TODO: oneOfType
};

export default SettingsContent;
