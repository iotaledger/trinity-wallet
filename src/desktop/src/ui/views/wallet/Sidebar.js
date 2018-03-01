import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { clearTempData } from 'actions/tempAccount';
import { getSeedItems, getSelectedIndex } from 'selectors/seeds';
import { NavLink } from 'react-router-dom';
import { selectSeed } from 'actions/seeds';

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
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Seed data state object
         * @ignore
         */
        seeds: PropTypes.array,
        /** Current seed index
         * @ignore
         */
        selectedSeedIndex: PropTypes.number,
        /** Change active account
         * @param {Number} Index - Target seed index
         * @ignore
         */
        selectSeed: PropTypes.func.isRequired,
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
        const { seeds, selectedSeedIndex, selectSeed, t, history, location } = this.props;
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
                            {seeds.map((seed, index) => {
                                return (
                                    <a
                                        aria-current={selectedSeedIndex === index}
                                        key={seed.seed}
                                        onClick={() => {
                                            selectSeed(index);
                                            history.push('/wallet/');
                                        }}
                                    >
                                        <strong>My acc</strong>
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
                            confirm: t('global:yes'),
                            cancel: t('global:no'),
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
    seeds: getSeedItems(state),
    selectedSeedIndex: getSelectedIndex(state),
});

const mapDispatchToProps = {
    selectSeed,
    clearTempData,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Sidebar));
