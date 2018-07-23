/* global Electron */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { zxcvbn } from 'libs/exports';

import { generateAlert } from 'actions/alerts';

import { passwordReasons } from 'libs/password';

import PasswordInput from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import css from './seedExport.scss';

/**
 * SeedVault export component
 */
class SeedExport extends PureComponent {
    static propTypes = {
        /** Target Seed */
        seed: PropTypes.array.isRequired,
        /** Seed title */
        title: PropTypes.string,
        /** On close event callback
         * @returns {undefined}
         */
        onClose: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        step: 1,
        password: '',
        passwordConfirm: '',
    };

    onClose = (e) => {
        e.preventDefault();

        this.setState({
            step: 1,
            password: '',
            passwordConfirm: '',
        });

        this.props.onClose();
    };

    onStep = (e) => {
        e.preventDefault();
        this.setState({ step: 2 });
    };

    exportSeed = async (e) => {
        const { seed, title, generateAlert, onClose, t } = this.props;
        const { password, passwordConfirm } = this.state;

        if (e) {
            e.preventDefault();
        }

        const score = zxcvbn(password);

        if (score.score < 4) {
            const reason = score.feedback.warning
                ? t(`changePassword:${passwordReasons[score.feedback.warning]}`)
                : t('changePassword:passwordTooWeakReason');

            return generateAlert('error', t('changePassword:passwordTooWeak'), reason);
        }

        if (password !== passwordConfirm) {
            return generateAlert(
                'error',
                t('changePassword:passwordsDoNotMatch'),
                t('changePassword:passwordsDoNotMatchExplanation'),
            );
        }

        const error = await Electron.exportSeeds(
            [
                {
                    title: title,
                    seed: seed,
                },
            ],
            password,
        );

        this.setState({
            step: 1,
            password: '',
            passwordConfirm: '',
        });

        if (error) {
            if (error !== 'Export cancelled') {
                return generateAlert('error', t('seedVault:exportFail'), t('seedVault:exportFailExplanation'));
            }
        } else {
            generateAlert('success', t('seedVault:exportSuccess'), t('seedVault:exportSuccessExplanation'));
        }

        Electron.garbageCollect();

        onClose();
    };

    render() {
        const { t } = this.props;

        if (this.state.step === 1) {
            return (
                <form className={css.seedExport} onSubmit={this.onStep}>
                    <section>
                        <h1>
                            <Icon icon="seedVault" size={120} />
                            {t('seedVault:exportSeedVault')}
                        </h1>
                        <p>{t('seedVault:seedVaultExplanation')}</p>
                        <p>
                            <strong>{t('seedVault:seedVaultWarning')}</strong>
                        </p>
                    </section>
                    <footer>
                        <Button onClick={this.onClose} className="square" variant="dark">
                            {t('goBack')}
                        </Button>
                        <Button type="submit" variant="primary" className="square">
                            {t('continue')}
                        </Button>
                    </footer>
                </form>
            );
        }

        const score = zxcvbn(this.state.password);

        return (
            <form className={css.seedExport} onSubmit={this.exportSeed}>
                <section>
                    <h1>
                        <Icon icon="seedVault" size={120} />
                        {t('seedVault:exportSeedVault')}
                    </h1>
                    <PasswordInput
                        focus
                        value={this.state.password}
                        label={t('password')}
                        showScore
                        showValid
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <PasswordInput
                        value={this.state.passwordConfirm}
                        label={t('setPassword:retypePassword')}
                        showValid
                        disabled={score.score < 4}
                        match={this.state.password}
                        onChange={(value) => this.setState({ passwordConfirm: value })}
                    />
                </section>
                <footer>
                    <Button onClick={this.onClose} className="square" variant="dark">
                        {t('goBack')}
                    </Button>
                    <Button type="submit" variant="primary" className="square">
                        {t('export')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    null,
    mapDispatchToProps,
)(translate()(SeedExport));
