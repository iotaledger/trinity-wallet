import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

import css from './index.scss';

/**
 * Sweep funds about component
 */
class About extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;

        return (
            <form>
                <section className={css.long}>
                    <h1>{t('sweeps:lockedFundsRecovery')}</h1>
                    <Info>
                        <p>{t('sweeps:lockedFundsRecoveryExplanation')}</p>
                        <p>{t('sweeps:lockedFundsToolExplanation')}</p>
                        <p>
                            <strong>{t('sweeps:lockedFundsOwnRiskExplanation')}</strong>
                        </p>
                    </Info>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:cancel')}
                        </Button>
                        <Button
                            id="to-transfer-funds"
                            onClick={() => this.props.history.push('/sweeps/transfer-funds')}
                            className="square"
                            variant="primary"
                        >
                            {t('global:accept')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    wallet: state.wallet,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
});

export default connect(mapStateToProps)(withTranslation()(About));
