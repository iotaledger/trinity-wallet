/* global Electron */
import React from '~/react';
import PropTypes from 'prop-types';
import { withTranslation } from '~/react-i18next';
import ReactMarkdown from 'react-markdown';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Scrollbar from 'ui/components/Scrollbar';
import Icon from 'ui/components/Icon';

import settings from '../../../package.json';

import changelog from '../../../CHANGELOG.md';

import css from './about.scss';

/**
 * About window component
 */
export class AboutComponent extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        visible: false,
    };

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    /**
     * Proxy native menu triggers to an action
     * @param {string} Item - Triggered menu item
     */
    menuToggle(item) {
        this.setState({
            visible: item === 'about',
        });
    }

    render() {
        const { visible } = this.state;
        const { t } = this.props;

        return (
            <Modal variant="global" isOpen={visible} onClose={() => this.setState({ visible: false })}>
                <section className={css.about}>
                    <Icon icon="iota" size={48} />
                    <h1>Trinity Wallet</h1>
                    <h2>v{settings.version}</h2>

                    <article>
                        <Scrollbar>
                            <ReactMarkdown source={changelog} />
                        </Scrollbar>
                    </article>
                    <footer>
                        <Button onClick={() => this.setState({ visible: false })} variant="dark">
                            {t('close')}
                        </Button>
                    </footer>
                </section>
            </Modal>
        );
    }
}

export default withTranslation()(AboutComponent);
