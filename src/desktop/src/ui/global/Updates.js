/*global Electron*/
import React from 'react';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';
import { getUpdateData, setUpdateDone } from 'actions/settings';
import { DESKTOP_VERSION } from 'config';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

/**
 * Updates helper component
 */
class Updates extends React.PureComponent {
    static propTypes = {
        /** Initiate update check
         * @param {Boolean} force - Force update confirmation dialog
         * @ignore
         */
        getUpdateData: PropTypes.func.isRequired,
        /** Mark update state as done
         * @ignore
         */
        setUpdateDone: PropTypes.func.isRequired,
        /** Current updates settings state
         * @ignore
         */
        update: PropTypes.object.isRequired,

        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.getUpdateData();
    }

    render() {
        const { update, setUpdateDone, t } = this.props;
        if (!update.version || update.done) {
            return null;
        }

        if (update.error) {
            return (
                <Modal variant="confirm" isOpen onClose={() => setUpdateDone()}>
                    <h1 className="error">{t('Error retreiving update data')}</h1>
                    <p>{t('There was an error retreiving upodate data.')}</p>
                    <footer>
                        <Button onClick={() => setUpdateDone()} variant="secondary">
                            {t('global:close')}
                        </Button>
                    </footer>
                </Modal>
            );
        }

        if (update.version === DESKTOP_VERSION) {
            return (
                <Modal variant="confirm" isOpen onClose={() => setUpdateDone()}>
                    <h1 className="success">{t('No updates currently available')}</h1>
                    <p>{t('You`ve got the latest version of IOTA Trinity desktop wallet!')}</p>
                    <footer>
                        <Button onClick={() => setUpdateDone()} variant="secondary">
                            {t('global:close')}
                        </Button>
                    </footer>
                </Modal>
            );
        }

        return (
            <Modal variant="confirm" isOpen onClose={() => setUpdateDone()}>
                <h1 className="success">{t('New version available')}</h1>
                <Trans i18nKey="">
                    <p>
                        A new <strong>Trinity</strong> <strong>{update.version}</strong> version is available. Please
                        read the release details carefully and verify the download source before updating:
                    </p>
                </Trans>
                <Info variant="blank">
                    <ReactMarkdown source={`- ${update.notes.join('\n- ')}`} />
                </Info>
                <footer>
                    <Button
                        onClick={() => {
                            Electron.gotoLatestRelease();
                            setUpdateDone();
                        }}
                        variant="primary"
                    >
                        {t('Download release')}
                    </Button>
                    <Button onClick={() => setUpdateDone()} variant="secondary">
                        {t('Skip')}
                    </Button>
                </footer>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    update: state.settings.update,
});

const mapDispatchToProps = {
    getUpdateData,
    setUpdateDone,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Updates));
