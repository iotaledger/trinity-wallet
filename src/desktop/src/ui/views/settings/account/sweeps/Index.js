import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import About from 'ui/views/settings/account/sweeps/About';
import TransferFunds from 'ui/views/settings/account/sweeps/TransferFunds';
import Done from 'ui/views/settings/account/sweeps/Done';

import Icon from 'ui/components/Icon';

import css from './index.scss';

/**
 * Sweeps functionality router wrapper component
 */
class Sweeps extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        isRecoveringFunds: PropTypes.bool.isRequired,
    };

    render() {
        const { location, history, isRecoveringFunds } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';

        return (
            <main className={css.sweeps}>
                {!isRecoveringFunds && (
                    <header>
                        <a onClick={() => history.push('/settings/tools')}>
                            <Icon icon="cross" size={24} />
                        </a>
                    </header>
                )}
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="slide" timeout={1000} mountOnEnter unmountOnExit>
                        <div>
                            <Switch location={location}>
                                <Route path="/sweeps/done" component={Done} />
                                <Route path="/sweeps/transfer-funds" component={TransferFunds} />
                                <Route path="/" component={About} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    isRecoveringFunds: state.ui.isRecoveringFunds,
});

export default connect(mapStateToProps)(withRouter(withTranslation()(Sweeps)));
