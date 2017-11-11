import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { addAndSelectSeed } from 'actions/seeds';
import { setOnboardingCompletionStatus } from 'actions/app';
import { showError } from 'actions/notifications';
// import { getSelectedSeed } from 'selectors/seeds';
import { isValidPassword } from '../../../../shared/libs/util';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';
import PasswordInput from '../UI/PasswordInput';
import css from '../Layout/Onboarding.css';

class SecurityEnter extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        showError: PropTypes.func.isRequired,
        setOnboardingCompletionStatus: PropTypes.func.isRequired,
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
        const { history, setOnboardingCompletionStatus, showError, t } = this.props;
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

        setOnboardingCompletionStatus(true);
        history.push('/done');
    };

    render() {
        const { t } = this.props;
        return (
            <Template type="form" onSubmit={this.onRequestNext}>
                <Content>
                    <p>{t('text')}</p>
                    <div className={css.formGroup}>
                        <PasswordInput placeholder={t('placeholder1')} name="password" onChange={this.changeHandler} />
                    </div>
                    <div className={css.formGroup}>
                        <PasswordInput
                            placeholder={t('placeholder2')}
                            name="passwordConfirm"
                            onChange={this.changeHandler}
                        />
                    </div>
                    <Infobox>
                        <p>{t('explanation')}</p>
                        <p>{t('reminder')}</p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/seed/name" variant="warning">
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
    setOnboardingCompletionStatus,
    addAndSelectSeed,
    showError,
};

export default translate('setPassword')(connect(null, mapDispatchToProps)(SecurityEnter));
