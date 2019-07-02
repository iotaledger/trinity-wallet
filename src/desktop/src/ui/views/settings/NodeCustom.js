import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import withNodeData from 'containers/settings/Node';

import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Scrollbar from 'ui/components/Scrollbar';
import Modal from 'ui/components/modal/Modal';
import Text from 'ui/components/input/Text';

import css from './index.scss';

/**
 * Custom node management component
 */
const NodeCustom = ({ customNodes, loading, onClose, removeCustomNode, setNode, t }) => {
    const [url, setUrl] = useState('');
    // const [token, setToken] = useState('');
    // const [password, setPassword] = useState('');
    // const [authVisible, setAuthVisible] = useState(false);

    useEffect(() => {
        setUrl('');
    }, [customNodes]);

    const addNode = (e) => {
        if (e) {
            e.preventDefault();
        }
        setNode({ url, token: '', password: '' }, true);
    };

    return (
        <Modal variant="fullscreen" isOpen onClose={onClose}>
            <section className={css.nodeCustom}>
                <form onSubmit={addNode}>
                    <fieldset>
                        <Text value={url} disabled={loading} label={t('addCustomNode:customNode')} onChange={setUrl} />
                        {/*
                    // Temporary disable authorisation entry #https://github.com/iotaledger/trinity-wallet/pull/1654
                    authVisible ? (
                        <Fragment>
                            <Text value={token} label={t('addCustomNode:username')} onChange={setToken} />
                            <Text value={password} label={t('addCustomNode:password')} onChange={setPassword} />
                        </Fragment>
                    ) : (
                        <a className={css.authLink} onClick={() => setAuthVisible(true)}>
                            <Icon icon="plusAlt" size={10} /> {t('addCustomNode:addAuthKey')}
                        </a>
                    )*/}
                    </fieldset>
                    <hr />
                    {customNodes.length ? (
                        <ul>
                            <Scrollbar>
                                {customNodes.map(({ url }) => (
                                    <li key={url}>
                                        <strong>{url}</strong>
                                        <a onClick={() => removeCustomNode(url)}>
                                            <Icon icon="cross" size={16} />
                                        </a>
                                    </li>
                                ))}
                            </Scrollbar>
                        </ul>
                    ) : (
                        <p>{t('nodeSettings:noCustomNodes')}</p>
                    )}
                </form>
            </section>
            <footer>
                <Button onClick={onClose} className="square" variant="dark">
                    {t('back')}
                </Button>
                <Button loading={loading} onClick={addNode} className="square" variant="primary">
                    {t('addCustomNode')}
                </Button>
            </footer>
        </Modal>
    );
};

NodeCustom.propTypes = {
    customNodes: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    removeCustomNode: PropTypes.func.isRequired,
    setNode: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default withNodeData(NodeCustom);
