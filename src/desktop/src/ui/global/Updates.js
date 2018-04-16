/*global Electron*/
import React from 'react';
import { connect } from 'react-redux';
import { translate, Interpolate } from 'react-i18next';
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
                    <h1 className="error">{t('errorRetrievingUpdateDataExplanation')}</h1>
                    <p>{t('errorRetrievingUpdateDataExplanation')}</p>
                    <footer>
                        <Button onClick={() => setUpdateDone()} variant="secondary">
                            {t('close')}
                        </Button>
                    </footer>
                </Modal>
            );
        }

        if (update.version === DESKTOP_VERSION) {
            return (
                <Modal variant="confirm" isOpen onClose={() => setUpdateDone()}>
                    <h1 className="success">{t('noUpdatesAvailable')}</h1>
                    <p>{t('noUpdatesAvailableExplanation')}</p>
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
                <h1 className="success">{t('newVersionAvailable')}</h1>
                {/*eslint-disable react/jsx-boolean-value*/}
                {/*// TODO: Contact jamuhl about why Trans component doesn't work here*/}
                <Interpolate
                    i18nKey="updates:newVersionAvailableExplanation"
                    useDangerouslySetInnerHTML={true}
                    version={update.version}
                >
                    <p>
                        A new <strong>Trinity</strong> <strong>{update.version}</strong> version is available. Please
                        read the release details carefully and verify the download source before updating:
                    </p>
                </Interpolate>
                {/*eslint-enable react/jsx-boolean-value*/}
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
                        {t('downloadRelease')}
                    </Button>
                    <Button onClick={() => setUpdateDone()} variant="secondary">
                        {t('skipUpdate')}
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

export default connect(mapStateToProps, mapDispatchToProps)(translate(['updates', 'global'])(Updates));
