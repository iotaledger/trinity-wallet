/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { shorten, capitalize } from 'libs/iota/converter';
import { formatIotas } from 'libs/iota/utils';
import { accumulateBalance } from 'libs/iota/addresses';

import { setAuthenticationStatus as setMoonPayAuthenticationStatus } from 'actions/exchanges/MoonPay';
import { clearWalletData, setSeedIndex } from 'actions/wallet';
import { getAccountNamesFromState } from 'selectors/accounts';

import MoonPayKeychainAdapter from 'libs/MoonPay';
import { __DEV__ } from 'config';

import Logo from 'ui/components/Logo';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';
import Confirm from 'ui/components/modal/Confirm';

import css from './index.scss';

/**
 * Wallet's sidebar component
 */
class Sidebar extends React.PureComponent {
    static propTypes = {
        /** Account names for wallet */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        accounts: PropTypes.object,
        /** @ignore */
        setSeedIndex: PropTypes.func.isRequired,
        /** @ignore */
        seedIndex: PropTypes.number,
        /** @ignore */
        isBusy: PropTypes.bool.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setMoonPayAuthenticationStatus: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    state = {
        modalLogout: false,
    };

    componentDidMount() {
        Electron.updateMenu('enabled', !this.props.isBusy);
    }

    accountSettings = (e, index) => {
        e.stopPropagation();
        this.props.history.push(`/settings/account/name/${index}`);
    };

    toggleLogout = () => {
        this.setState((prevState) => ({
            modalLogout: !prevState.modalLogout,
        }));
    };

    doLogout = () => {
        this.setState({
            modalLogout: false,
        });

        MoonPayKeychainAdapter.clear()
            .then(() => {
                this.props.setMoonPayAuthenticationStatus(false);
                this.props.clearWalletData();
                this.props.history.push('/onboarding/');
            })
            .catch((error) => {
                if (__DEV__) {
                    /* eslint-disable no-console */
                    console.log(error);
                    /* eslint-enable no-console */
                }
            });
    };

    render() {
        // Use accountNames prop for displaying account names here because accountNames prop preserves the account index
        const { accountNames, accounts, seedIndex, setSeedIndex, t, location, history, isBusy, themeName } = this.props;
        const { modalLogout } = this.state;

        return (
            <aside>
                <div>
                    <Logo size={60} themeName={themeName} />
                </div>

                <nav>
                    <div className={isBusy ? css.disabled : null}>
                        <a aria-current={location.pathname === '/wallet/'}>
                            <Icon icon="wallet" size={20} />
                        </a>
                        <ul>
                            <Scrollbar>
                                {accountNames.map((account, index) => {
                                    return (
                                        <a
                                            aria-current={index === seedIndex}
                                            key={account}
                                            onClick={() => {
                                                setSeedIndex(index);
                                                history.push('/wallet/');
                                            }}
                                        >
                                            <strong>{shorten(account, 16)}</strong>
                                            <small>
                                                {formatIotas(
                                                    accumulateBalance(
                                                        accounts.accountInfo[account].addressData.map(
                                                            (addressData) => addressData.balance,
                                                        ),
                                                    ),
                                                    false,
                                                    true,
                                                )}
                                            </small>
                                            <div onClick={(e) => this.accountSettings(e, index)}>
                                                <Icon icon="settingsAlt" size={16} />
                                            </div>
                                        </a>
                                    );
                                })}
                                <a onClick={() => history.push('/onboarding/seed-intro')}>
                                    + {t('accountManagement:addNewAccount')}
                                </a>
                            </Scrollbar>
                        </ul>
                    </div>
                </nav>
                <nav className={isBusy ? css.disabled : null}>
                    <NavLink to="/settings">
                        <Icon icon="settings" size={20} />
                        <strong>{capitalize(t('home:settings'))}</strong>
                    </NavLink>
                    <a onClick={this.toggleLogout}>
                        <Icon icon="logout" size={20} />
                        <strong>{t('settings:logout')}</strong>
                    </a>
                    <Confirm
                        isOpen={modalLogout}
                        content={{
                            title: t('logoutConfirmationModal:logoutConfirmation'),
                            confirm: t('yes'),
                            cancel: t('no'),
                            animation: { name: 'logout', loop: false },
                        }}
                        themeName={themeName}
                        onCancel={this.toggleLogout}
                        onConfirm={this.doLogout}
                    />
                </nav>
            </aside>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    accounts: state.accounts,
    seedIndex: state.wallet.seedIndex,
    isBusy:
        state.ui.isSyncing ||
        state.ui.isSendingTransfer ||
        state.ui.isGeneratingReceiveAddress ||
        state.ui.isFetchingAccountInfo,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    clearWalletData,
    setSeedIndex,
    setMoonPayAuthenticationStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Sidebar));
