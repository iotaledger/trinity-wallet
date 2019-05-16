import React, { useState } from 'react';
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
    const [address, setAddress] = useState('');
    const [auth, setAuth] = useState('');
    const [authVisible, setAuthVisible] = useState(false);

    return (
        <Modal variant="fullscreen" isOpen onClose={onClose}>
            <section className={css.nodeCustom}>
                <fieldset>
                    <Text value={address} label={t('addCustomNode:customNode')} onChange={setAddress} />
                    {authVisible ? (
                        <Text value={auth} label={t('addCustomNode:addAuthKey')} onChange={setAuth} />
                    ) : (
                        <a onClick={() => setAuthVisible(true)}>
                            <Icon icon="plusAlt" size={10} /> {t('addCustomNode:addAuthKey')}
                        </a>
                    )}
                </fieldset>
                <hr />
                {customNodes.length ? (
                    <ul>
                        <Scrollbar>
                            {customNodes.map((node) => (
                                <li key={node}>
                                    <strong>{node}</strong>
                                    <a onClick={() => removeCustomNode(node)}>
                                        <Icon icon="cross" size={16} />
                                    </a>
                                </li>
                            ))}
                        </Scrollbar>
                    </ul>
                ) : (
                    <p>{t('nodeSettings:noCustomNodes')}</p>
                )}
            </section>
            <footer>
                <Button onClick={onClose} className="square" variant="dark">
                    {t('back')}
                </Button>
                <Button loading={loading} onClick={() => setNode(address, true)} className="square" variant="primary">
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
