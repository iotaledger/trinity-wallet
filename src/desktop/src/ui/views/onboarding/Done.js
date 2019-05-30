/* global Electron */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { getAnimation } from 'animations';
import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/**
 * Onboarding complete component
 */
class Done extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    /**
     * Navigate to Login view
     * @returns {undefined}
     */
    setComplete = () => {
        const { history } = this.props;
        Electron.garbageCollect();
        history.push('/onboarding/login');
    };

    render() {
        const { t, themeName } = this.props;
        return (
            <form>
                <section className={classNames(css.done, css.long)}>
                    <h1>{t('onboardingComplete:allDone')}</h1>
                    <p>{t('onboardingComplete:walletReady')}</p>
                    <Lottie width={340} height={340} data={getAnimation('onboardingComplete', themeName)} />
                </section>
                <footer>
                    <Button id="done-next" onClick={this.setComplete} className="square" variant="primary">
                        {t('onboardingComplete:openYourWallet')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(withI18n()(Done));
