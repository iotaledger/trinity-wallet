import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BackHandler, View, StyleSheet } from 'react-native';
import { navigator } from 'libs/navigation';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { withNamespaces } from 'react-i18next';
import timer from 'react-native-timer';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { renderSettingsRows } from 'ui/components/SettingsContent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

/**
 * Add new account component
 */
class AddNewAccount extends Component {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.addNewSeed = this.addNewSeed.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('AddNewAccount');
    }

    /**
     * Navigate to new seed setup screen
     *
     * @method addNewSeed
     */
    addNewSeed() {
        navigator.push('newSeedSetup');
        timer.clearInterval('inactivityTimer');
        BackHandler.removeEventListener('homeBackPress');
    }

    /**
     * Render setting rows
     *
     * @method renderSettingsContent
     *
     * @returns {function}
     */
    renderSettingsContent() {
        const { theme, t } = this.props;
        const rows = [
            { name: t('useExistingSeed'), icon: 'key', function: () => this.props.setSetting('addExistingSeed') },
            { name: t('createNewSeed'), icon: 'plusAlt', function: this.addNewSeed },
            { name: 'back', function: () => this.props.setSetting('accountManagement') },
        ];
        return renderSettingsRows(rows, theme);
    }

    render() {
        return <View style={styles.container}>{this.renderSettingsContent()}</View>;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
};

export default withNamespaces(['addNewAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddNewAccount));
