import React from 'react';
import PropTypes from 'prop-types';

import { getAnimation } from 'animations';

import Lottie from 'ui/components/Lottie';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';

import css from './modal.scss';
/**
 * Confirmation window component
 */
export default class Confirm extends React.PureComponent {
    static propTypes = {
        /** Confirm window visibility state */
        isOpen: PropTypes.bool.isRequired,
        /** Should the confirmation option disabled for X seconds */
        countdown: PropTypes.number,
        /** Confirm window type */
        category: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative']),
        /** Confirm window content */
        content: PropTypes.object.isRequired,
        /** Confirm window cancel function */
        onCancel: PropTypes.func.isRequired,
        /** Confirm window confirm function */
        onConfirm: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string,
    };

    render() {
        const { category, content, isOpen, countdown, themeName } = this.props;

        return (
            <Modal variant="confirm" onClose={this.props.onCancel} isOpen={isOpen}>
                {content.title ? <h1 className={category ? css[category] : null}>{content.title}</h1> : null}
                {content.animation ? (
                    <Lottie
                        width={content.animation.size || 240}
                        height={content.animation.size || 240}
                        data={getAnimation(content.animation.name, themeName)}
                        loop={content.animation.loop}
                    />
                ) : null}
                {content.message ? <div>{content.message}</div> : null}
                <footer>
                    <Button onClick={this.props.onCancel} variant="dark">
                        {content.cancel}
                    </Button>
                    <Button
                        disabled={countdown > 0}
                        onClick={this.props.onConfirm}
                        variant={category ? category : 'primary'}
                    >
                        {countdown && countdown > 0 ? countdown : content.confirm}
                    </Button>
                </footer>
            </Modal>
        );
    }
}
