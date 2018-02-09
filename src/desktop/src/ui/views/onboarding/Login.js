/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/storage';
import { setFirstUse } from 'actions/account';
import { showError } from 'actions/notifications';
import { clearTempData } from 'actions/tempAccount';
import { loadSeeds, clearSeeds } from 'actions/seeds';
import { runTask } from 'worker';
import PasswordInput from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';

class Login extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        account: PropTypes.shape({
            firstUse: PropTypes.bool.isRequired,
        }).isRequired,
        tempAccount: PropTypes.object.isRequired,
        loadSeeds: PropTypes.func.isRequired,
        showError: PropTypes.func.isRequired,
        clearTempData: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
    };

    state = {
        loading: false,
        password: '',
    };

    componentDidMount() {
        this.props.clearTempData();
        this.props.clearSeeds();
        Electron.updateMenu('authorised', false);
    }

    componentWillReceiveProps(newProps) {
        const { tempAccount } = this.props;

        const hasError =
            !tempAccount.hasErrorFetchingAccountInfoOnLogin && newProps.tempAccount.hasErrorFetchingAccountInfoOnLogin;

        if (hasError) {
            this.setState({
                loading: false,
            });
        }
    }

    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    setupAccount(seed) {
        const { account } = this.props;

        if (account.firstUse) {
            runTask('getFullAccountInfo', [seed.seed, seed.name]);
        } else {
            runTask('getAccountInfo', [seed.seed, seed.name]);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { password } = this.state;
        const { t, loadSeeds, showError } = this.props;

        let seeds = null;

        try {
            seeds = getSecurelyPersistedSeeds(password);
        } catch (err) {
            showError({
                title: t('global:unrecognisedPassword'),
                text: t('global:unrecognisedPasswordExplanation'),
            });
        }

        if (seeds) {
            loadSeeds(seeds);
            const seed = seeds.items[seeds.selectedSeedIndex];

            this.setState({
                loading: true,
            });

            this.setupAccount(seed, seeds.selectedSeedIndex);
        }
    };

    render() {
        const { t, account } = this.props;
        const { loading } = this.state;

        if (loading) {
            return (
                <Loading
                    loop
                    title={account.firstUse ? t('loading:thisMayTake') : null}
                    subtitle={account.firstUse ? t('loading:loadingFirstTime') : null}
                />
            );
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <main>
                    <section>
                        <PasswordInput
                            value={this.state.password}
                            label={t('global:password')}
                            name="password"
                            onChange={this.setPassword}
                        />
                    </section>
                    <footer>
                        <Button to="/seedlogin" className="outline" variant="highlight">
                            {t('login:useSeed')}
                        </Button>
                        <Button className="outline" variant="primary">
                            {t('login:login')}
                        </Button>
                    </footer>
                </main>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = {
    showError,
    loadSeeds,
    clearTempData,
    clearSeeds,
    setFirstUse,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Login));
