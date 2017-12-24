import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MainSettings from './mainSettings';
import AdvancedSettings from './advancedSettings';
import AccountManagement from './accountManagement';
import ViewSeed from './viewSeed';
import ViewAddresses from '../containers/viewAddresses';
import EditAccountName from './editAccountName';
import DeleteAccount from './deleteAccount';
import AddNewAccount from './addNewAccount';
import UseExistingSeed from './useExistingSeed';
import NodeSelection from './nodeSelection';
import AddCustomNode from './addCustomNode';
import CurrencySelection from './currencySelection';
import LanguageSelection from './languageSelection';
import ChangePassword from './changePassword';
import ManualSync from './manualSync';

const SETTINGS_COMPONENTS = {
    mainSettings: MainSettings,
    advancedSettings: AdvancedSettings,
    accountManagement: AccountManagement,
    viewSeed: ViewSeed,
    viewAddresses: ViewAddresses,
    editAccountName: EditAccountName,
    deleteAccount: DeleteAccount,
    addNewAccount: AddNewAccount,
    addExistingSeed: UseExistingSeed,
    nodeSelection: NodeSelection,
    addCustomNode: AddCustomNode,
    currencySelection: CurrencySelection,
    languageSelection: LanguageSelection,
    changePassword: ChangePassword,
    manualSync: ManualSync,
};

const SettingsContent = ({ component, ...props }) => {
    const Component = SETTINGS_COMPONENTS[component];

    return <Component {...props} />;
};

SettingsContent.propTypes = {
    component: PropTypes.string.isRequired, // TODO: oneOfType
};

export default SettingsContent;
