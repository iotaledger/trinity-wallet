import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import icons from 'icons/icons';

import css from './icon.scss';

/**
 * Icon component
 */
export default class Icon extends React.PureComponent {
    static propTypes = {
        /** Icon type */
        icon: PropTypes.oneOf(Object.keys(icons).concat(['seedVault', 'seedWrite', 'seedPrint'])).isRequired,
        /** Icon size in pixels */
        size: PropTypes.number,
        /** Icon fill color */
        color: PropTypes.string,
    };

    render() {
        const { size, icon, color } = this.props;

        if (icon === 'seedWrite') {
            return (
                <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M20.81 57.838a3.143 3.143 0 0 1-.166-1.01V14.642c0-.157.011-.312.034-.463.155-.022.316-.033.48-.033 1.22 0 1.732 1.494 2.598 1.494.866 0 1.38-1.494 2.598-1.494 1.2 0 1.721 1.45 2.581 1.45.86 0 1.382-1.45 2.581-1.45 1.198 0 1.72 1.45 2.58 1.45.86 0 1.382-1.45 2.581-1.45 1.198 0 1.72 1.45 2.58 1.45.861 0 1.382-1.45 2.581-1.45 1.2 0 1.721 1.45 2.58 1.45.861 0 1.382-1.45 2.581-1.45 1.2 0 1.721 1.45 2.581 1.45.86 0 1.381-1.45 2.58-1.45.164 0 .325.01.481.033.022.15.034.306.034.463V56.83c0 .356-.059.696-.165 1.009a3.36 3.36 0 0 1-.35.018c-1.199 0-1.72-1.453-2.58-1.453-.86 0-1.382 1.453-2.58 1.453-1.2 0-1.72-1.453-2.582-1.453-.859 0-1.38 1.453-2.58 1.453-1.199 0-1.72-1.453-2.58-1.453-.86 0-1.383 1.453-2.58 1.453-1.2 0-1.722-1.453-2.582-1.453-.86 0-1.382 1.453-2.58 1.453-1.199 0-1.72-1.453-2.58-1.453-.86 0-1.383 1.453-2.582 1.453-1.218 0-1.732-1.495-2.598-1.495-.866 0-1.379 1.495-2.598 1.495-.118 0-.235-.006-.349-.018"
                        className="colors-animations-3"
                    />
                    <path
                        d="M33.939 26.573v.119a.682.682 0 0 1-.682.68h-4.062a.682.682 0 0 1-.682-.68v-.12c0-.375.305-.681.681-.681h4.063c.376 0 .682.306.682.682zm6.982 0v.119a.682.682 0 0 1-.682.68h-4.062a.682.682 0 0 1-.682-.68v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm6.983 0v.119a.682.682 0 0 1-.682.68H43.16a.682.682 0 0 1-.682-.68v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm-22.282.059a.741.741 0 1 1-1.483 0 .741.741 0 0 1 1.483 0zm8.317 3.688v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.305-.681.681-.681h4.063c.376 0 .682.306.682.682zm6.982 0v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm6.983 0v.119a.683.683 0 0 1-.682.682H43.16a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm-22.282.06a.741.741 0 1 1-1.483-.001.741.741 0 0 1 1.483 0zm8.317 3.687v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.305-.681.681-.681h4.063c.376 0 .682.306.682.682zm6.982 0v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm6.983 0v.119a.683.683 0 0 1-.682.682H43.16a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm-22.282.06a.741.741 0 1 1-1.483-.001.741.741 0 0 1 1.483 0zm8.317 3.688v.117a.683.683 0 0 1-.682.683h-4.062a.683.683 0 0 1-.682-.683v-.117c0-.377.305-.683.681-.683h4.063c.376 0 .682.306.682.683zm6.982 0v.117a.683.683 0 0 1-.682.683h-4.062a.683.683 0 0 1-.682-.683v-.117c0-.377.306-.683.682-.683h4.062c.376 0 .682.306.682.683zm6.983 0v.117a.683.683 0 0 1-.682.683H43.16a.683.683 0 0 1-.682-.683v-.117c0-.377.306-.683.682-.683h4.062c.376 0 .682.306.682.683zm-22.282.059a.742.742 0 1 1-1.484-.002.742.742 0 0 1 1.484.002zm8.317 3.688v.117a.683.683 0 0 1-.682.683h-4.062a.683.683 0 0 1-.682-.683v-.117c0-.377.305-.682.681-.682h4.063c.376 0 .682.305.682.681zm6.982 0v.117a.683.683 0 0 1-.682.683h-4.062a.683.683 0 0 1-.682-.683v-.117c0-.377.306-.682.682-.682h4.062c.376 0 .682.305.682.681zm6.983 0v.117a.683.683 0 0 1-.682.683H43.16a.683.683 0 0 1-.682-.683v-.117c0-.377.306-.682.682-.682h4.062c.376 0 .682.305.682.681zm-22.282.06a.741.741 0 1 1-1.483-.002.741.741 0 0 1 1.483.001zm8.317 3.687v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.305-.681.681-.681h4.063c.376 0 .682.306.682.682zm6.982 0v.119a.683.683 0 0 1-.682.682h-4.062a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm6.983 0v.119a.683.683 0 0 1-.682.682H43.16a.683.683 0 0 1-.682-.682v-.12c0-.375.306-.681.682-.681h4.062c.376 0 .682.306.682.682zm-22.282.06a.741.741 0 1 1-1.483-.001.741.741 0 0 1 1.483 0z"
                        className="colors-animations-4"
                    />
                    <path
                        d="M52.675 28.457A7.546 7.546 0 0 1 60.217 36a7.544 7.544 0 0 1-7.542 7.542A7.544 7.544 0 0 1 45.133 36a7.546 7.546 0 0 1 7.542-7.543"
                        className="colors-animations-2"
                    />
                    <path
                        className="colors-animations-4"
                        d="M51.56 36.724l3.362-3.432 1 .981-4.343 4.434-.015-.014-.006.006-.704-.7-.276-.272.002-.003-1.448-1.444.989-.993z"
                    />
                    <path
                        d="M71.265 36c0 19.606-15.894 35.5-35.5 35.5C16.158 71.5.265 55.606.265 36S16.158.5 35.765.5c19.606 0 35.5 15.894 35.5 35.5zm-1 0c0-19.054-15.447-34.5-34.5-34.5-19.054 0-34.5 15.446-34.5 34.5 0 19.054 15.446 34.5 34.5 34.5 19.053 0 34.5-15.446 34.5-34.5z"
                        className="colors-animations-4"
                    />
                </svg>
            );
        }

        if (icon === 'seedVault') {
            return (
                <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M19.799 16.347c10.898 0 16.195-8.223 16.334-7.949.115-.23 5.402 7.88 16.3 7.88 2.293 0 4.467-.625 6.413-1.743v22.93c0 13.382-22.634 26.23-22.795 26.143-.077.04-22.665-12.69-22.665-26.075v-22.93c1.947 1.12 4.12 1.744 6.413 1.744"
                        className="colors-animations-3"
                    />
                    <path
                        d="M32.044 29.288a4.077 4.077 0 0 1 4.072-4.072 4.077 4.077 0 0 1 4.072 4.072 4.076 4.076 0 0 1-4.072 4.07 4.076 4.076 0 0 1-4.072-4.07m9.717 0a5.652 5.652 0 0 0-5.645-5.646 5.652 5.652 0 0 0-5.645 5.646 5.652 5.652 0 0 0 4.858 5.589V48.78a.786.786 0 0 0 1.573 0v-.715h2.632a.57.57 0 0 0 0-1.137h-2.632v-.796h2.632a.57.57 0 0 0 0-1.137h-2.632v-10.12a5.653 5.653 0 0 0 4.859-5.588"
                        className="colors-animations-4"
                    />
                    <path
                        d="M56.501 27.044c4.939 0 8.95 4.01 8.95 8.95 0 4.94-4.011 8.95-8.95 8.95-4.94 0-8.95-4.01-8.95-8.95 0-4.94 4.01-8.95 8.95-8.95"
                        className="colors-animations-2"
                    />
                    <path
                        className="colors-animations-4"
                        d="M55.179 36.852l3.989-4.071 1.188 1.164-5.156 5.262-.017-.017-.007.007-.835-.832-.328-.322.003-.003-1.72-1.714 1.174-1.177z"
                    />
                    <path
                        d="M71.5 36c0 19.606-15.894 35.5-35.5 35.5S.5 55.606.5 36 16.394.5 36 .5 71.5 16.394 71.5 36zm-1 0C70.5 16.946 55.054 1.5 36 1.5 16.946 1.5 1.5 16.946 1.5 36c0 19.054 15.446 34.5 34.5 34.5 19.054 0 34.5-15.446 34.5-34.5z"
                        className="colors-animations-4"
                    />
                </svg>
            );
        }

        if (icon === 'seedPrint') {
            return (
                <svg width={size} height={size} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M60.298 28.627a6.992 6.992 0 0 0-6.99-6.99H16.923a6.993 6.993 0 0 0-6.99 6.99v20.97h50.366v-20.97z"
                        className="colors-animations-3"
                    />
                    <path fill="#043451" d="M17.774 49.597h35.24V33.359h-35.24z" />
                    <path
                        d="M23.593 53.676h23.181V33.253H23.593zm.071-31.968h23.197v-3.384H23.664z"
                        className="colors-animations-4"
                    />
                    <path
                        d="M33.147 36.315v.073a.421.421 0 0 1-.421.422h-3.081a.423.423 0 0 1-.422-.422v-.073c0-.232.19-.421.422-.421h3.08c.234 0 .422.189.422.42zm5.05 0v.073a.421.421 0 0 1-.422.422h-3.08a.422.422 0 0 1-.422-.422v-.073c0-.232.19-.421.422-.421h3.08c.234 0 .422.189.422.42zm5.051 0v.073a.422.422 0 0 1-.422.422h-3.081a.422.422 0 0 1-.421-.422v-.073c0-.232.189-.421.421-.421h3.081c.233 0 .422.189.422.42zm-16.115.037a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.916h.156c.252 0 .458.205.458.458zm6.014 2.279v.073a.42.42 0 0 1-.421.422h-3.081a.422.422 0 0 1-.422-.422v-.073c0-.232.19-.421.422-.421h3.08c.234 0 .422.189.422.42zm5.05 0v.073a.42.42 0 0 1-.422.422h-3.08a.421.421 0 0 1-.422-.422v-.073c0-.232.19-.421.422-.421h3.08c.234 0 .422.189.422.42zm5.051 0v.073a.421.421 0 0 1-.422.422h-3.081a.421.421 0 0 1-.421-.422v-.073c0-.232.189-.421.421-.421h3.081c.233 0 .422.189.422.42zm-16.115.037a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.916h.156c.252 0 .458.205.458.458zm6.014 2.28v.072a.421.421 0 0 1-.421.422h-3.081a.423.423 0 0 1-.422-.422v-.073c0-.232.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.05 0v.072a.421.421 0 0 1-.422.422h-3.08a.422.422 0 0 1-.422-.422v-.073c0-.232.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.051 0v.072a.422.422 0 0 1-.422.422h-3.081a.422.422 0 0 1-.421-.422v-.073c0-.232.189-.422.421-.422h3.081c.233 0 .422.19.422.422zm-16.115.036a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.917h.156a.46.46 0 0 1 .458.46zm6.014 2.28v.073a.42.42 0 0 1-.421.42h-3.081a.422.422 0 0 1-.422-.42v-.073c0-.232.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.05 0v.073a.42.42 0 0 1-.422.42h-3.08a.421.421 0 0 1-.422-.42v-.073c0-.232.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.051 0v.073a.421.421 0 0 1-.422.42h-3.081a.421.421 0 0 1-.421-.42v-.073c0-.232.189-.422.421-.422h3.081c.233 0 .422.19.422.422zm-16.115.036a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.916h.156c.252 0 .458.205.458.458zm6.014 2.28v.073a.42.42 0 0 1-.421.421h-3.081a.422.422 0 0 1-.422-.42v-.074c0-.233.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.05 0v.073a.42.42 0 0 1-.422.421h-3.08a.421.421 0 0 1-.422-.42v-.074c0-.233.19-.422.422-.422h3.08c.234 0 .422.19.422.422zm5.051 0v.073a.421.421 0 0 1-.422.421h-3.081a.421.421 0 0 1-.421-.42v-.074c0-.233.189-.422.421-.422h3.081c.233 0 .422.19.422.422zm-16.115.036a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.916h.156c.252 0 .458.205.458.458zm6.014 2.28v.072a.42.42 0 0 1-.421.422h-3.081a.422.422 0 0 1-.422-.422v-.073c0-.232.19-.42.422-.42h3.08a.42.42 0 0 1 .422.42zm5.05 0v.072a.42.42 0 0 1-.422.422h-3.08a.421.421 0 0 1-.422-.422v-.073c0-.232.19-.42.422-.42h3.08a.42.42 0 0 1 .422.42zm5.051 0v.072a.421.421 0 0 1-.422.422h-3.081a.421.421 0 0 1-.421-.422v-.073a.42.42 0 0 1 .421-.42h3.081c.233 0 .422.188.422.42zm-16.115.037a.459.459 0 0 1-.458.458h-.156a.458.458 0 1 1 0-.916h.156c.252 0 .458.205.458.458z"
                        className="colors-animations-1"
                    />
                    <path
                        d="M53.015 27.554a2.595 2.595 0 0 0-2.594-2.593H20.368a2.594 2.594 0 0 0 0 5.186H50.42a2.595 2.595 0 0 0 2.594-2.593"
                        className="colors-animations-6"
                    />
                    <path
                        d="M48.42 25.83a1.724 1.724 0 1 1 0 3.448 1.724 1.724 0 0 1 0-3.448m13.435 2.503a7.546 7.546 0 0 1 7.542 7.542 7.546 7.546 0 0 1-7.542 7.543 7.547 7.547 0 0 1-7.543-7.543 7.546 7.546 0 0 1 7.543-7.542"
                        className="colors-animations-2"
                    />
                    <path
                        d="M61.855 29.916c3.289 0 5.96 2.67 5.96 5.959 0 3.29-2.671 5.96-5.96 5.96a5.962 5.962 0 0 1-5.96-5.96 5.962 5.962 0 0 1 5.96-5.959"
                        className="colors-animations-2"
                    />
                    <path
                        d="M60.74 36.6l3.362-3.432 1 .98-4.343 4.435-.015-.014-.007.006-.703-.702-.276-.27.002-.002-1.45-1.445.99-.993z"
                        className="colors-animations-4"
                    />
                    <path
                        d="M71.735 36c0 19.606-15.893 35.5-35.5 35.5C16.63 71.5.735 55.606.735 36S16.63.5 36.235.5c19.607 0 35.5 15.894 35.5 35.5zm-1 0c0-19.054-15.446-34.5-34.5-34.5-19.053 0-34.5 15.446-34.5 34.5 0 19.054 15.447 34.5 34.5 34.5 19.054 0 34.5-15.446 34.5-34.5z"
                        className="colors-animations-4"
                    />
                </svg>
            );
        }

        return (
            <span
                className={classNames(css.icon, css[icon])}
                style={{ fontSize: size || 32, lineHeight: size ? `${size}px` : 32, color: color || null }}
            >
                {icons[icon]}
            </span>
        );
    }
}
