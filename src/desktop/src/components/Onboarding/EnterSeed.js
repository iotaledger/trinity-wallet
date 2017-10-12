import React from 'react';
import PropTypes from 'prop-types';
import QrReader from 'react-qr-reader';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from '../../../../shared/libs/util';
import { showError } from 'actions/notifications';
import Header from './Header';
import Button from '../UI/Button';
import Infobox from '../UI/Infobox';

import css from '../Layout/Onboarding.css';

class EnterSeed extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        showError: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: '',
    };

    onChange = e => {
        const { target: { name, value = '' } } = e;
        this.setState(() => ({
            [name]: value.replace(/[^A-Z9]*/g, ''),
        }));
    };

    getPaddedSeed = seed => {
        return `${seed}${'9'.repeat(81 - seed.length < 0 ? 0 : 81 - seed.length)}`;
    };

    openScanner = () => {
        this.setState(() => ({
            showScanner: true,
        }));
    };

    closeScanner = () => {
        this.setState(() => ({
            showScanner: false,
        }));
    };

    onScanEvent = seed => {
        console.log('SEED:', seed);
        if (seed !== null) {
            this.setState(() => ({
                showScanner: false,
                seed,
            }));
        }
    };

    onScanError = err => {
        console.log(err);
    };

    onSubmit = e => {
        e.preventDefault();
        const { history, showError, t } = this.props;
        if (!isValidSeed(this.state.seed)) {
            showError({
                title: t('invalid_seed_title'),
                text: t('invalid_seed_text'),
            });
            return;
        }
        history.push('/onboarding/security/password');
    };

    render() {
        const { t } = this.props;
        const { seed = '', showScanner } = this.state;
        return (
            <form onSubmit={this.onSubmit}>
                <Header headline={t('title')} />
                <main>
                    <div className={css.formGroup}>
                        <textarea
                            name="seed"
                            className={css.seed}
                            placeholder={t('placeholder')}
                            value={seed}
                            onChange={this.onChange}
                            maxLength={81}
                            rows={6}
                        />
                        <p>{seed.length}/81</p>
                    </div>
                    {(!showScanner && (
                        <Button type="button" onClick={this.openScanner}>
                            Scan QR
                        </Button>
                    )) || (
                        <div>
                            <Button type="button" onClick={this.closeScanner}>
                                CLOSE
                            </Button>
                            <QrReader
                                delay={350}
                                className={css.qrScanner}
                                onError={this.onScanError}
                                onScan={this.onScanEvent}
                            />
                        </div>
                    )}
                    <Infobox>
                        <p>{t('seed_explanation')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Infobox>
                </main>
                <footer>
                    <Button to="/onboarding/wallet" variant="warning">
                        {t('button2')}
                    </Button>
                    <Button type="submit" variant="success">
                        {t('button1')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapDispatchToProps = {
    showError,
};

export default translate('enterSeed')(connect(null, mapDispatchToProps)(EnterSeed));
