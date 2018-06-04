/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import { setActivationCode } from 'actions/app';
import { checkActivationCode } from 'libs/crypto';

import Button from 'ui/components/Button';
import Text from 'ui/components/input/Text';

import css from './index.scss';

/**
 * Alpha version activation view
 */
class Activation extends React.PureComponent {
    static propTypes = {
        /** Set activation code
         * @ignore
         */
        setActivationCode: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
    };

    state = {
        uuid: null,
        input: '',
        loading: false,
    };

    componentDidMount() {
        Electron.getUuid().then((uuid) => {
            this.setState({
                uuid: uuid,
            });
        });
    }

    setCode = async (e) => {
        const { setActivationCode, generateAlert } = this.props;
        const { uuid, input, loading } = this.state;

        e.preventDefault();

        if (loading) {
            return;
        }

        if (input.length < 256 && /(.+)@(.+){2,}\.(.+){2,}/.test(input)) {
            this.setState({
                loading: true,
            });

            const data = {
                email: input,
                uuid: uuid,
            };

            fetch('https://trinity-alpha.iota.org', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json',
                },
            })
                .then(() => {
                    this.setState({
                        loading: false,
                        input: '',
                    });

                    generateAlert(
                        'success',
                        'Activation code sent',
                        'You should receive an activation code in a few minutes.',
                    );
                })
                .catch(() => {
                    generateAlert('error', 'Error requesting activation code', 'Something went wrong :/');
                    this.setState({
                        loading: false,
                        input: '',
                    });
                });
        } else {
            const isCodeValid = await checkActivationCode(input, uuid);

            if (isCodeValid) {
                setActivationCode(input);
            } else {
                generateAlert(
                    'error',
                    'Incorrect activation code',
                    'You entered an invalid activation code or e-mail.',
                );
            }
        }
    };

    render() {
        if (!this.state.uuid) {
            return null;
        }

        return (
            <main className={css.onboarding}>
                <header />
                <div>
                    <div>
                        <form onSubmit={this.setCode}>
                            <section>
                                <h1>Activate your copy of Trinity wallet</h1>
                                <p>Enter your activation code or e-mail below</p>
                                <Text
                                    focus
                                    value={this.state.input}
                                    label="Activation code"
                                    onChange={(value) => this.setState({ input: value })}
                                />
                            </section>
                            <footer>
                                <Button type="submit" loading={this.state.loading} className="square" variant="primary">
                                    Activate
                                </Button>
                            </footer>
                        </form>
                    </div>
                </div>
            </main>
        );
    }
}

const mapDispatchToProps = {
    setActivationCode,
    generateAlert,
};

export default connect(null, mapDispatchToProps)(Activation);
