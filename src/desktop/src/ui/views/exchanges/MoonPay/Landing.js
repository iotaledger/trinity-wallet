import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAnimation } from 'animations';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/** MoonPay landing screen component */
class Landing extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, themeName } = this.props;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <React.Fragment>
                                <p style={{ fontSize: '28px', marginBottom: '20px' }}>
                                    {t('moonpay:buyIOTAInstantly')}
                                </p>
                                <Lottie
                                    width={180}
                                    height={180}
                                    data={getAnimation('welcome', themeName)}
                                    segments={[161, 395]}
                                    loop
                                />
                            </React.Fragment>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:supportExplanation')}
                            </p>
                        </div>
                    </Info>
                    <a style={{ textDecoration: 'underline' }}>{t('moonpay:termsAndConditionsApply')}</a>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-transfer-funds"
                            onClick={() => this.props.history.push('/exchanges/moonpay/add-amount')}
                            className="square"
                            variant="primary"
                        >
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
    wallet: state.wallet,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
});

export default connect(mapStateToProps)(withTranslation()(Landing));
