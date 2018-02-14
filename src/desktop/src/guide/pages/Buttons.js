import React from 'react';
import Button from 'ui/components/Button';
import css from './buttons.css';

const variants = ['primary', 'secondary', 'positive', 'negative', 'extra', 'highlight'];

class Buttons extends React.PureComponent {
    state = {};

    loadingDummy = (variant) => {
        this.setState({
            [variant]: true,
        });

        setTimeout(() => {
            this.setState({
                [variant]: false,
            });
        }, 3000);
    };

    render() {
        return (
            <div className={css.buttons}>
                <h1>Buttons</h1>
                <nav>
                    <div>
                        {variants.map((variant, key) => {
                            return (
                                <Button key={key} variant={variant}>
                                    {variant}
                                </Button>
                            );
                        })}
                    </div>
                    <div>
                        {variants.map((variant, key) => {
                            return (
                                <Button key={key} disabled variant={variant}>
                                    Disabled
                                </Button>
                            );
                        })}
                    </div>
                    <div>
                        {variants.map((variant, key) => {
                            return (
                                <Button className="outline" key={key} variant={variant}>
                                    {variant}
                                </Button>
                            );
                        })}
                    </div>
                    <div>
                        {variants.map((variant, key) => {
                            return (
                                <Button className="small" key={key} variant={variant}>
                                    Small
                                </Button>
                            );
                        })}
                    </div>
                    <div>
                        {variants.map((variant, key) => {
                            return (
                                <Button
                                    key={key}
                                    variant={variant}
                                    onClick={() => this.loadingDummy(variant)}
                                    loading={this.state[variant]}
                                >
                                    {variant} load
                                </Button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        );
    }
}

export default Buttons;
