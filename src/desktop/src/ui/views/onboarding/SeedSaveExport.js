/* global Electron */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import zxcvbn from 'zxcvbn';

import { generateAlert } from 'actions/alerts';

import { passwordReasons } from 'libs/i18next';

import PasswordInput from 'ui/components/input/Password';
import Button from 'ui/components/Button';

/**
 * Onboarding, Seed export step
 */
class SeedExport extends PureComponent {
    static propTypes = {
        /** Target Seed */
        seed: PropTypes.array.isRequired,
        /**  On close event callback
         */
        onClose: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        passwordConfirm: '',
    };

    exportSeed = async (e) => {
        const { seed, generateAlert, onClose, t } = this.props;
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

        console.log(seed, password);
        const error = await Electron.exportSeed(seed, password);

        if (error) {
            if (error !== 'Export cancelled') {
                return generateAlert('error', t('Error saving export file'), t('Error saving export file'));
            }
        } else {
            generateAlert('success', 'Keyfile saved!', 'Lorem ipsum dolor sit amet!');
        }

        onClose();
    };

    render() {
        const { onClose, t } = this.props;

        const score = zxcvbn(this.state.password);

        return (
            <form onSubmit={(e) => this.exportSeed(e)}>
                <section>
                    <h1>Export seed keyfile</h1>
                    <p>Whats a keyfile. What to do with it. How to do that.</p>
                    <p>
                        <strong>Warning</strong>! Lorem ipsum dolor sit amet!
                    </p>
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
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        className="square"
                        variant="secondary"
                    >
                        {t('goBack')}
                    </Button>
                    <Button type="submit" variant="primary" className="square">
                        Export
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
