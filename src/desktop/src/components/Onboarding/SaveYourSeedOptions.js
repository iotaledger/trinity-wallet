import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Template, { Content, Footer } from './Template';
import SeedManualCopy from 'components/Onboarding/SeedManualCopy';
import SeedCopyToClipboard from 'components/Onboarding/SeedCopyToClipboard';
import SeedPaperWallet from 'components/Onboarding/SeedPaperWallet';
import Button from 'components/UI/Button';

import css from 'components/Layout/Onboarding.css';

class SaveYourSeedOptions extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
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
                                <Button onClick={e => this.changeType(e, 'manual')} variant="extra">
                                    {t('global:manualCopy')}
                                </Button>
                                <Button onClick={e => this.changeType(e, 'paper')} variant="extra">
                                    {t('global:paperWallet')}
                                </Button>
                                <Button onClick={e => this.changeType(e, 'clipboard')} variant="extra">
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
                    <Button to="/seed/generate" variant="warning">
                        {t('global:back')}
                    </Button>
                    {/* TODO: Remove the console log and think of a solution when to actually clear the seeds */}
                    <Button to="/seed/enter" onClick={() => console.log('CLEAR SEEDS HERE')} variant="success">
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    clearSeeds,
};

export default translate('saveYourSeed')(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeedOptions));
