import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed } from 'actions/seeds';
import { showError } from 'actions/notifications';
// import { getSelectedSeed } from 'selectors/seeds';
import { isValidPassword } from '../../../../shared/libs/util';
import Template, { Main, Footer } from './Template';
import Button from '../UI/Button';
import PasswordInput from '../UI/PasswordInput';
import css from '../Layout/Onboarding.css';

class SecurityEntry extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        showError: PropTypes.func.isRequired,
    };

    state = {};

    changeHandler = e => {
        const { target: { name, value } } = e;
        this.setState(() => ({
            [name]: value,
        }));
    };

    onRequestNext = e => {
        e.preventDefault();
        const { history, showError, t } = this.props;
        const { password, passwordConfirm } = this.state;

        if (password !== passwordConfirm) {
            return showError({
                title: t('error2_title'),
                text: t('error2_text'),
            });
        }

        if (!isValidPassword(password)) {
            return showError({
                title: t('error1_title'),
                text: t('error1_text'),
            });
        }

        history.push('/done');
    };

    render() {
        const { t } = this.props;
        return (
            <Template headline={t('title')} type="form" onSubmit={this.onRequestNext}>
                <Main>
                    <p>{t('explanation')}</p>
                    <div className={css.formGroup}>
                        <PasswordInput name="password" onChange={this.changeHandler} />
                    </div>
                    <div className={css.formGroup}>
                        <PasswordInput name="passwordConfirm" onChange={this.changeHandler} />
                    </div>
                </Main>
                <Footer>
                    <Button to="/security/intro" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button type="submit" variant="success">
                        {t('button1')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

// const mapStateToProps = state => ({});

const mapDispatchToProps = {
    addAndSelectSeed,
    showError,
};

export default translate('setPassword')(connect(null, mapDispatchToProps)(SecurityEntry));
