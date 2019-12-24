import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { getAnimation } from 'animations';
import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/**
 * Sweep funds success component
 */
class Done extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    render() {
        const { t, themeName } = this.props;
        return (
            <form>
                <section className={classNames(css.done, css.long)}>
                    <h1>{t('global:success')}</h1>
                    <p>{t('sweeps:fundsUnlockedExplanation')}</p>
                    <Lottie width={340} height={340} data={getAnimation('onboardingComplete', themeName)} />
                </section>
                <footer>
                    <Button
                        id="done-next"
                        onClick={() => this.props.history.push('/wallet')}
                        className="square"
                        variant="primary"
                    >
                        {t('global:done')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(withTranslation()(Done));
