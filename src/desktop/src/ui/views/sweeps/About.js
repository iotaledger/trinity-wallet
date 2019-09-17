import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

import css from './index.scss';

class About extends React.PureComponent {
    render() {
        const { t } = this.props;

        return (
            <form>
                <section className={css.long}>
                    <h1>{t('sweeps:lockedFundsRecovery')}</h1>
                    <Info>
                        <Trans i18nKey="sweeps:lockedFundsRecoveryExplanation">
                            <p>
                                <span>
                                    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                                    Ipsum has been the industry standard dummy text ever since the 1500s, when an
                                    unknown printer took a galley of type and scrambled it to make a type specimen book.
                                    It has survived not only five centuries, but also the leap into electronic
                                    typesetting, remaining essentially unchanged. It was popularised in the 1960s with
                                    the release of Letraset sheets containing Lorem Ipsum passages, and more recently
                                    with desktop publishing software like Aldus PageMaker including versions of Lorem
                                    Ipsum.
                                </span>
                            </p>
                        </Trans>
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
