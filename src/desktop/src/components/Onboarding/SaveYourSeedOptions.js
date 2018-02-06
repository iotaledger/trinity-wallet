import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content, Footer } from 'components/Onboarding/Template';
import SeedManualCopy from 'components/Onboarding/SeedManualCopy';
import SeedCopyToClipboard from 'components/Onboarding/SeedCopyToClipboard';
import SeedPaperWallet from 'components/Onboarding/SeedPaperWallet';
import Button from 'ui/components/Button';

import css from 'components/Layout/Onboarding.css';

class SaveYourSeedOptions extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
        match: PropTypes.object.isRequired,
    };

    state = {
        type: this.props.match.params.type,
    };

    changeType = (e, type) => {
        e.preventDefault();
        this.setState(() => ({
            type: type,
        }));
    };

    render() {
        const { t } = this.props;
        const { type } = this.state;

        return (
            <Template bodyClass={css.bodySeed}>
                <Content>
                    <div className="columns">
                        <aside>
                            <p>
                                {t('saveYourSeed:mustSaveYourSeed')} <strong>{t('saveYourSeed:atLeastOne')}</strong>{' '}
                                {t('saveYourSeed:ofTheOptions')}
                            </p>
                            <nav>
                                <Button onClick={(e) => this.changeType(e, 'manual')} variant="secondary">
                                    {t('global:manualCopy')}
                                </Button>
                                <Button onClick={(e) => this.changeType(e, 'paper')} variant="secondary">
                                    {t('global:paperWallet')}
                                </Button>
                                <Button onClick={(e) => this.changeType(e, 'clipboard')} variant="secondary">
                                    {t('copyToClipboard:copyToClipboard')}
                                </Button>
                            </nav>
                        </aside>
                        <section>
                            {type === 'clipboard' ? (
                                <SeedCopyToClipboard {...this.props} />
                            ) : type === 'paper' ? (
                                <SeedPaperWallet {...this.props} />
                            ) : (
                                <SeedManualCopy {...this.props} />
                            )}
                        </section>
                    </div>
                </Content>
                <Footer>
                    <Button to="/seed/generate" className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    {/* TODO: Remove the console log and think of a solution when to actually clear the seeds */}
                    <Button
                        to="/seed/enter"
                        onClick={() => console.log('CLEAR SEEDS HERE')}
                        className="outline"
                        variant="primary"
                    >
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    clearSeeds,
};

export default translate('saveYourSeed')(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeedOptions));
