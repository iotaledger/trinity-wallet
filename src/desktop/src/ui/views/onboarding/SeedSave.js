import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Clipboard from 'ui/components/Clipboard';

import css from './index.css';

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** Current user defined seed */
        seed: PropTypes.string,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <React.Fragment>
                <section>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <p className={css.hideOnPrint}>
                            You must save your seed with<strong>at least one</strong> of the options listed below.
                        </p>
                    </Trans>
                    <div className={css.seed}>
                        {seed.split('').map((letter, index) => {
                            return <span key={`seed-${index}`}>{letter}</span>;
                        })}
                    </div>
                    <nav>
                        <Clipboard
                            text={seed}
                            timeout={60}
                            title={t('copyToClipboard:seedCopied')}
                            success={t('copyToClipboard:seedCopiedExplanation')}
                        >
                            <Button className="icon">
                                <Icon icon="copy" size={32} />
                                {t('copyToClipboard:copyToClipboard')}
                            </Button>
                        </Clipboard>
                        <Button className="icon" onClick={() => window.print()}>
                            <Icon icon="print" size={32} />
                            {t('paperWallet:printWallet').toLowerCase()}
                        </Button>
                    </nav>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="inline" variant="secondary">
                        {t('back').toLowerCase()}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="large" variant="primary">
                        {t('next').toLowerCase()}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.seeds.newSeed,
});

export default connect(mapStateToProps)(translate()(SeedSave));
