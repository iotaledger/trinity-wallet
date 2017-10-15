import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import BoxedSeed from './BoxedSeed';
import Header from './Header';
import Button from '../UI/Button';
import Steps from '../UI/Steps';
import css from './SeedCopyToClipboard.css';

class SeedCopyToClipboard extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <Header headline={t('title')} />
                <Steps currentStep="clipboard" />
                <main>
                    <p>
                        Click the button below to copy your seed to a password manager. It will stay in your clipboard
                        until you continue to your next screen.
                    </p>
                    <BoxedSeed t={t} seed={seed} />
                    <div className={css.buttonWrapper}>
                        <CopyToClipboard text={seed}>
                            <Button
                                variant="success"
                                onClick={() =>
                                    this.props.showNotification({
                                        type: 'success',
                                        title: 'Seed copied to clipboard!',
                                    })}
                            >
                                {t('button1')}
                            </Button>
                        </CopyToClipboard>
                    </div>
                </main>
                <footer>
                    <Button to="/onboarding/seed/save" variant="warning">
                        {t('button2')}
                    </Button>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    showNotification,
};

export default translate('saveYourSeed3')(connect(mapStateToProps, mapDispatchToProps)(SeedCopyToClipboard));
