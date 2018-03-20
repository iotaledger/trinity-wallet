import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { clearTempData, setSeedIndex } from 'actions/tempAccount';

import Logo from 'ui/components/Logo';
import Icon from 'ui/components/Icon';
import Confirm from 'ui/components/modal/Confirm';

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
        accounts: PropTypes.array,
        /** Set seed index state
         *  @param {Number} Index - Seed index
         */
        setSeedIndex: PropTypes.func.isRequired,
        /** Current seed index
         * @ignore
         */
        seedIndex: PropTypes.number,
        /** Clear temporary seed state data
         * @ignore
         */
        clearTempData: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        modalLogout: false,
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
        this.props.clearTempData();
        this.props.history.push('/onboarding/');
    };

    render() {
        const { accounts, seedIndex, setSeedIndex, t, location, history } = this.props;
        const { modalLogout } = this.state;

        return (
            <aside>
                <div>
                    <Logo size={60} />
                </div>

                <nav>
                    <div>
                        <a aria-current={location.pathname === '/wallet/'}>
                            <Icon icon="wallet" size={20} />
                        </a>
                        <ul>
                            {accounts.map((account, index) => {
                                return (
                                    <a
                                        aria-current={index === seedIndex}
                                        key={account}
                                        onClick={() => {
                                            setSeedIndex(index);
                                            history.push('/wallet/');
                                        }}
                                    >
                                        <strong>{account}</strong>
                                    </a>
                                );
                            })}
                        </ul>
                    </div>
                    <NavLink to="/wallet/charts">
                        <Icon icon="chart" size={20} />
                    </NavLink>
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
    accounts: state.account.accountNames,
    seedIndex: state.tempAccount.seedIndex,
});

const mapDispatchToProps = {
    clearTempData,
    setSeedIndex,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Sidebar));
