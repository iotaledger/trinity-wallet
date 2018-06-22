import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { shorten } from 'libs/helpers';
import { formatIota } from 'libs/iota/utils';

import { clearWalletData, setSeedIndex } from 'actions/wallet';

import Logo from 'ui/components/Logo';
import Icon from 'ui/components/Icon';
import Confirm from 'ui/components/modal/Confirm';

import css from './index.scss';

/**
 * Wallet's sidebar component
 */
class Sidebar extends React.PureComponent {
    static propTypes = {
        /* Browser location objects */
        location: PropTypes.object,
        /** Available account names
         * @ignore
         */
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Accounts state data */
        accounts: PropTypes.object,
        /** Set seed index state
         *  @param {Number} Index - Seed index
         */
        setSeedIndex: PropTypes.func.isRequired,
        /** Current seed index
         * @ignore
         */
        seedIndex: PropTypes.number,
        /** Is wallet ready to switch accounts */
        isReady: PropTypes.bool.isRequired,
        /** Clear wallet state data
         * @ignore
         */
        clearWalletData: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        modalLogout: false,
    };

    accountSettings = (e, index) => {
        e.stopPropagation();

        this.props.setSeedIndex(index);
        this.props.history.push('/account/name');
    };

    toggleLogout = () => {
        this.setState({
            modalLogout: !this.state.modalLogout,
        });
    };

    doLogout = () => {
        this.setState({
            modalLogout: false,
        });
        this.props.clearWalletData();
        this.props.history.push('/onboarding/');
    };

    render() {
        const { accounts, seedIndex, setSeedIndex, t, location, history, isReady } = this.props;
        const { modalLogout } = this.state;

        return (
            <aside>
                <div>
                    <Logo size={60} />
                </div>

                <nav>
                    <div className={isReady ? css.disabled : null}>
                        <a aria-current={location.pathname === '/wallet/'}>
                            <Icon icon="wallet" size={20} />
                        </a>
                        <ul>
                            {accounts.accountNames.map((account, index) => {
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
                                        <small>{formatIota(accounts.accountInfo[account].balance)}</small>
                                        <div onClick={(e) => this.accountSettings(e, index)}>
                                            <Icon icon="settings" size={16} />
                                        </div>
                                    </a>
                                );
                            })}
                            <a onClick={() => history.push('/onboarding/seed-intro')}>
                                + {t('accountManagement:addNewAccount')}
                            </a>
                        </ul>
                    </div>
                </nav>
                <nav>
                    <NavLink to="/settings">
                        <Icon icon="settings" size={20} />
                        <strong>{t('home:settings').toLowerCase()}</strong>
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
                        }}
                        onCancel={this.toggleLogout}
                        onConfirm={this.doLogout}
                    />
                </nav>
            </aside>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts,
    seedIndex: state.wallet.seedIndex,
    isReady:
        !state.wallet.ready || state.ui.isSyncing || state.ui.isSendingTransfer || state.ui.isGeneratingReceiveAddress,
});

const mapDispatchToProps = {
    clearWalletData,
    setSeedIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Sidebar));
