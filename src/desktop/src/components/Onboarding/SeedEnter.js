import React from 'react';
import PropTypes from 'prop-types';
import QrReader from 'react-qr-reader';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { showError } from 'actions/notifications';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import { isValidSeed, MAX_SEED_LENGTH } from '../../../../shared/libs/util';
import Template, { Content, Footer } from './Template';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Infobox from '../UI/Infobox';

import css from '../Layout/Onboarding.css';

class SeedEnter extends React.PureComponent {
    static propTypes = {
        addAndSelectSeed: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        // selectedSeed: PropTypes.shape({
        //     seed: PropTypes.string,
        // }).isRequired,
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
        return `${seed}${'9'.repeat(MAX_SEED_LENGTH - seed.length < 0 ? 0 : MAX_SEED_LENGTH - seed.length)}`;
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
        const { addAndSelectSeed, clearSeeds, history, showError, t } = this.props;
        const { seed } = this.state;
        if (!isValidSeed(seed)) {
            showError({
                title: t('invalid_seed_title'),
                text: t('invalid_seed_text'),
            });
            return;
        }
        clearSeeds();
        addAndSelectSeed(seed);
        history.push('/seed/name');
    };

    render() {
        const { t } = this.props;
        const { seed = '', showScanner } = this.state;
        return (
            <Template type="form" onSubmit={this.onSubmit}>
                <Content>
                    <div className={css.formGroup}>
                        <textarea
                            name="seed"
                            className={css.seed}
                            placeholder={t('placeholder')}
                            value={seed}
                            onChange={this.onChange}
                            maxLength={MAX_SEED_LENGTH}
                            rows={6}
                        />
                        <p>
                            {seed.length}/{MAX_SEED_LENGTH}
                        </p>
                    </div>
                    {/* TODO: prettier fucks this whole part up. maybe we can find a better solution here */}
                    {!showScanner && (
                        <Button type="button" onClick={this.openScanner} variant="cta">
                            {t('scan_code')}
                        </Button>
                    )}
                    <Modal
                        isOpen={showScanner}
                        onStateChange={showScanner => this.setState({ showScanner })}
                        hideCloseButton
                    >
                        {/* prevent qrscanner from scanning if not shown */}
                        {showScanner && (
                            <QrReader
                                delay={350}
                                className={css.qrScanner}
                                onError={this.onScanError}
                                onScan={this.onScanEvent}
                            />
                        )}
                        <Button type="button" onClick={this.closeScanner} variant="cta">
                            {t('close')}
                        </Button>
                    </Modal>
                    <Infobox>
                        <p>{t('seed_explanation')}</p>
                        <p>
                            <strong>{t('reminder')}</strong>
                        </p>
                    </Infobox>
                </Content>
                <Footer>
                    <Button to="/wallet-setup" variant="warning">
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

const mapStateToProps = state => ({
    selectedSeed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    addAndSelectSeed,
    clearSeeds,
};

export default translate('enterSeed')(connect(mapStateToProps, mapDispatchToProps)(SeedEnter));
