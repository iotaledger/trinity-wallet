import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/storage';
import { getAccountInfo, getFullAccountInfo, setFirstUse } from 'actions/account';
import { showError } from 'actions/notifications';
import { loadSeeds } from 'actions/seeds';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import PasswordInput from 'components/UI/input/Password';
import Button from 'components/UI/Button';
import Loading from 'components/UI/Loading';
import css from '../Layout/Onboarding.css';
import { setTimeout } from 'timers';

class Login extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        account: PropTypes.shape({
            firstUse: PropTypes.bool.isRequired,
        }).isRequired,
        loadSeeds: PropTypes.func.isRequired,
        showError: PropTypes.func.isRequired,
        getFullAccountInfo: PropTypes.func.isRequired,
        setFirstUse: PropTypes.func.isRequired,
    };

    state = {
        loading: false,
    };

    changeHandler = e => {
        const { target: { name, value } } = e;
        this.setState(() => ({
            [name]: value,
        }));
    };

    setupAccount(seed, seedIndex) {
        const { t, account, getFullAccountInfo, getAccountInfo, showError, setFirstUse } = this.props;

        if (account.firstUse) {
            getFullAccountInfo(seed.seed, seed.name, (error, success) => {
                this.setState({
                    loading: false,
                });
                if (error) {
                    showError({
                        title: t('global:invalidResponse'),
                        text: t('global:invalidResponseExplanation'),
                    });
                } else {
                    setFirstUse(false);
                    this.props.history.push('/balance');
                }
            });
        } else {
            getAccountInfo(seed.name, seedIndex, account.accountInfo, (error, success) => {
                if (error) {
                    showError({
                        title: t('global:invalidResponse'),
                        text: t('global:invalidResponseExplanation'),
                    });
                } else {
                    this.props.history.push('/balance');
                }
            });
        }
    }

    handleSubmit = e => {
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

            //TODO: Fix iota.api call freeze. Do API calls in a worker/electron main?
            setTimeout(() => this.setupAccount(seed, seeds.selectedSeedIndex), 2000);
        }
    };

    render() {
        const { t } = this.props;
        const { loading } = this.state;

        if (loading) return <Loading loop={true} />;

        return (
            <div className={css.wrapper}>
                <Template type="form" onSubmit={this.handleSubmit}>
                    <Content>
                        <label>Password:</label>
                        <PasswordInput name="password" onChange={this.changeHandler} />
                    </Content>
                    <Footer>
                        <Button to="/seedlogin" variant="warning">
                            USE SEED
                        </Button>
                        <Button variant="success">DONE</Button>
                    </Footer>
                </Template>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    account: state.account,
});

const mapDispatchToProps = {
    showError,
    loadSeeds,
    getFullAccountInfo,
    getAccountInfo,
    setFirstUse,
};

export default translate('login')(connect(mapStateToProps, mapDispatchToProps)(Login));
