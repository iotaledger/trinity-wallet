import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';
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

    static defaultProps = {
        seed: 'BSWMMBSBPVWAXYYVTYAAHDONCCZIXGJCMQOXTRGKK9PIVVRCMXYJWKUBWHOP9VUIZNFTIKHOIYKTIODGD',
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
                            <Button variant="success">{t('button1')}</Button>
                        </CopyToClipboard>
                    </div>
                </main>
                <footer>
                    <Button to="/" variant="warning">
                        {t('button2')}
                    </Button>
                </footer>
            </div>
        );
    }
}

export default translate('saveYourSeed3')(SeedCopyToClipboard);
