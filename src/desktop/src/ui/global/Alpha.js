import React from 'react';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';

/**
 * Alpha release warning modal
 */
class AlphaWarning extends React.PureComponent {
    state = {
        active: true,
    };

    render() {
        const { active } = this.state;

        return (
            <Modal variant="global" isOpen={active} onClose={() => {}}>
                <section>
                    <article>
                        <h1 style={{ color: 'var(--negative)' }}>Alpha release warning</h1>
                        <p>
                            This is an early (alpha) release of the wallet. It is to be used for testing purposes only,
                            with very small amounts of tokens.
                        </p>
                    </article>
                    <footer>
                        <Button onClick={() => this.setState({ active: false })} variant="dark">
                            Continue
                        </Button>
                    </footer>
                </section>
            </Modal>
        );
    }
}

export default AlphaWarning;
