import React from 'react';
import Button from 'components/UI/Button';
import css from './Buttons.css';

const variants = ['primary', 'secondary', 'warning', 'extra', 'highlight'];

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
                {variants.map((variant, key) => {
                    return (
                        <Button key={key} variant={variant}>
                            {variant}
                        </Button>
                    );
                })}
                <hr />
                {variants.map((variant, key) => {
                    return (
                        <Button key={key} disabled variant={variant}>
                            Disabled
                        </Button>
                    );
                })}
                <hr />
                {variants.map((variant, key) => {
                    return (
                        <Button className="outline" key={key} variant={variant}>
                            {variant}
                        </Button>
                    );
                })}
                <hr />
                {variants.map((variant, key) => {
                    return (
                        <Button className="small" key={key} variant={variant}>
                            {variant} small
                        </Button>
                    );
                })}
                <hr />
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
        );
    }
}

export default Buttons;
