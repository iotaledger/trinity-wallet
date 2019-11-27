import get from 'lodash/get';
import some from 'lodash/some';
import React, { PureComponent } from 'react';
import { Keyboard, View } from 'react-native';
import { withTranslation } from 'react-i18next';
import navigator from 'libs/navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { WebView } from 'react-native-webview';
import { createPaymentCard } from 'shared-modules/actions/exchanges/MoonPay';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { API_KEY } from 'shared-modules/exchanges/MoonPay';
import { height, width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isAndroid, isIPhoneX } from 'libs/device';
import { getCustomerAddress, getCustomerPaymentCards, getCustomerId } from 'shared-modules/selectors/exchanges/MoonPay';
import { parse } from 'shared-modules/libs/utils';

/**
 * Renders html for webview
 *
 * @method renderHtml
 *
 * @param {object} theme
 * @param {function} t
 * @param {object} customerAddress
 * @param {string} customerId
 *
 * @returns {string}
 */
const renderHtml = (theme, t, customerAddress, customerId) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

    <style>
    body {
      background-color: ${theme.body.bg};
    }

    span[id*="cc-"] {
      height: ${height / 14}px;
    }

    .form-field {
      display: block;
      padding: .475rem .75rem;
      line-height: 0.75;
      background-color: ${theme.input.bg};
      border-radius: ${Styling.borderRadius}px;
    }

    .form-field iframe {
      height: 100%;
      vertical-align: middle;
      width: 100%;
    }

    .logo-container {
        padding-top: ${height / 16}px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

      .info-box-container {
        display: flex;
        text-align: center;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: ${width}px;
        background-color: ${theme.dark.color};
      }

      .info-box-wrapper {
        width: ${Styling.contentWidth}px;
        padding-top: ${height / 22}px;
        padding-bottom: ${height / 22}px;
      }

      .header-container {
        padding-left: -100 !important;
        padding-right: -100 !important;
        margin-right: -100 !important;
        margin-left: 0 !important;
        margin-bottom: 20px;
        width: 100%;
        padding-top: 18px;
        padding-bottom: 18px;
        justify-content: center;
        align-items: center;
        display: flex;
        flex-direction: column;
        color: ${theme.body.color};
        text-align: 'center';
        background-color: ${theme.dark.color};
      }

      .title {
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 300;
        font-size: ${Styling.fontSize6}px;
        background-color: transparent;
        color: ${theme.body.color};
      }

      .subtitle {
        padding-top: ${height / 60}px;
        color: ${theme.body.color};
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 400;
        font-size: ${Styling.fontSize3}px;
        background-color: transparent;
      }

      .field-label {
        text-transform: uppercase;
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 400;
        font-size: ${Styling.fontSize2}px;
        color: ${theme.body.color};
        margin-bottom: ${height / 100}px;
        margin-left: 1px;
      }

      .buttons-container {
        display: flex;
        justify-content: center;
      }

      .button-left {
        height: ${Styling.footerButtonHeight}px;
        border-color: ${theme.dark.color};
        width: ${isIPhoneX ? Styling.contentWidth / 2 : width / 2}px;
        border-width: ${isIPhoneX ? 10 : 0};
        border-bottom-left-radius: ${isIPhoneX ? Styling.borderRadiusExtraLarge : 0}px;
        border-top-left-radius: ${isIPhoneX ? Styling.borderRadiusExtraLarge : 0}px;
        color: ${theme.dark.body};
        flex: 1;
        background-color: ${theme.dark.color};
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 600;
        font-size: ${Styling.fontSize3}px;
      }

      .button-right {
        height: ${Styling.footerButtonHeight}px;
        width: ${isIPhoneX ? Styling.contentWidth / 2 : width / 2}px;
        border-width: ${isIPhoneX ? 10 : 0};
        border-color: ${theme.dark.color};
        border-bottom-right-radius: ${isIPhoneX ? Styling.borderRadiusExtraLarge : 0}px;
        border-top-right-radius: ${isIPhoneX ? Styling.borderRadiusExtraLarge : 0}px;
        flex: 1;
        color: ${theme.primary.body};
        background-color: ${theme.primary.color};
        font-family: 'Source Sans Pro', sans-serif;
        font-weight: 600;
        font-size: ${Styling.fontSize3}px;
      }

      button:focus {
        outline:0;
      }

      .field-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-bottom: ${height / 25}px;
        margin-top: ${height / 25}px;
        margin-left: ${width / 20}px;
        margin-right: ${width / 20}px;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: ${height}px;
      }

      .top-container {
        flex: 1;
        align-items: center;
        align-content: flex-start;
      }

      .mid-container {
        flex: 4;
        align-items: center;
        align-self: center;
        width: ${width}px;
        align-content: space-between;
      }

      .bottom-container {
        flex: 0.5;
        align-items: flex-end;
        align-content: flex-end;
      }
    </style>
  </head>
  <body>

  <div class="container">
    <div class="top-container">
        <div class="logo-container">
            <svg style="fill:${
                theme.body.color
            }" width="325px" height="125px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0,529.746688 C0,457.377981 58.6655118,398.711552 131.033088,398.711552 C203.400664,398.711552 262.066176,457.377981 262.066176,529.746688 C262.066176,602.115395 203.400664,660.781824 131.033088,660.781824 C58.6655118,660.781824 0,602.115395 0,529.746688 Z M242.98496,399.575808 C242.98496,379.927832 258.912792,364 278.560768,364 C298.208744,364 314.136576,379.927832 314.136576,399.575808 C314.136576,419.223784 298.208744,435.151616 278.560768,435.151616 C258.912792,435.151616 242.98496,419.223784 242.98496,399.575808 Z M322.654208,594.948864 L345.204736,478.110464 L377.72288,478.110464 L382.134272,535.784192 C383.440896,552.131328 383.604736,568.961792 383.604736,568.961792 L383.768576,568.961792 C383.768576,568.961792 388.999168,553.272064 395.698176,538.731264 L423.80288,478.110464 L457.465856,478.110464 L434.925568,594.95296 L413.190144,594.95296 L426.092544,527.954688 C428.054528,517.823232 431.812608,503.442176 431.812608,503.442176 L431.484928,503.442176 C431.484928,503.442176 426.418176,516.025088 421.842944,525.828864 L389.650432,594.948864 L367.427584,594.948864 L361.867264,525.988608 C361.211904,517.327616 361.048064,503.43808 361.048064,503.43808 L360.720384,503.43808 C360.720384,503.43808 358.760448,518.472448 356.962304,527.950592 L344.059904,594.948864 L322.654208,594.948864 Z M490.14784,597.406464 L490.14784,597.40032 C468.250624,597.40032 450.766848,583.992064 450.766848,558.351104 C450.766848,531.878656 469.395456,508.838656 497.99168,508.838656 C519.397376,508.838656 536.71936,522.23872 536.71936,547.076864 C536.71936,573.874944 518.744064,597.406464 490.14784,597.406464 Z M472.662016,559.651584 C472.662016,571.089664 477.728768,580.895488 490.637312,580.895488 C507.631616,580.895488 514.822144,562.428672 514.822144,546.41536 C514.822144,535.466752 509.749248,525.335296 496.846848,525.335296 C480.014336,525.335296 472.662016,543.472384 472.662016,559.651584 Z M576.915456,597.40032 L576.917504,597.40032 C555.020288,597.40032 537.530368,583.992064 537.530368,558.34496 C537.530368,531.872512 556.167168,508.830464 584.759296,508.832512 C606.164992,508.832512 623.486976,522.232576 623.486976,547.07072 C623.486976,573.8688 605.51168,597.40032 576.915456,597.40032 Z M559.43168,559.651584 C559.43168,571.089664 564.498432,580.895488 577.406976,580.895488 C594.40128,580.895488 601.591808,562.428672 601.591808,546.41536 C601.591808,535.466752 596.518912,525.335296 583.616512,525.335296 C566.784,525.335296 559.43168,543.472384 559.43168,559.651584 Z M657.967104,511.113984 L655.517696,524.354304 L656.007168,524.354304 C663.195648,514.059008 670.222336,508.830464 682.151936,508.830464 C698.820608,508.830464 708.460544,522.398464 704.702464,542.008064 L694.571008,594.948864 L672.673792,594.948864 L682.477568,544.61312 C684.603392,533.500672 680.353792,527.454976 671.039488,527.454976 C660.74624,527.454976 653.391872,536.93312 651.104256,549.188352 L642.279424,594.94272 L620.382208,594.94272 L636.561408,511.113984 L657.967104,511.113984 Z M704.866304,594.94272 L727.414784,478.108416 L772.34176,478.108416 C794.728448,478.108416 809.598976,490.691328 809.598976,512.588544 C809.598976,537.590528 791.78752,552.624896 765.642752,552.624896 L737.210368,552.624896 L729.051136,594.94272 L704.866304,594.94272 Z M747.669504,498.531072 L740.978688,533.500672 L764.502016,533.500672 C775.450624,533.500672 785.41824,527.616768 785.41824,513.727232 C785.41824,504.251136 779.859968,498.531072 769.23904,498.531072 L747.669504,498.531072 Z M851.605504,594.948864 C850.531075,592.025932 850.140159,588.895799 850.46272,585.7984 L850.13504,585.7984 C845.068288,591.190784 838.85056,596.910848 826.76736,596.910848 C813.852672,596.910848 800.131072,589.558528 800.131072,572.236544 C800.131072,550.013696 817.778688,545.932032 838.20544,544.293632 C853.89312,542.98496 859.938816,542.331648 859.938816,533.998336 C859.938816,527.960832 855.199744,524.684032 846.866432,524.684032 C837.715968,524.684032 831.668224,528.28032 829.708288,536.613632 L810.098688,536.613632 C812.865536,519.455488 826.112,508.996352 847.681536,508.996352 C868.43392,508.996352 884.1216,517.982976 879.546368,542.331648 L871.704576,582.527744 C870.559744,588.247808 871.051264,592.169728 872.357888,594.129664 L872.357888,594.948864 L851.605504,594.948864 Z M821.211136,570.270464 C821.211136,577.79072 826.441728,581.71264 833.792,581.70855 C845.232128,581.70855 852.580352,574.518016 854.218752,566.838016 L856.834048,553.601792 C851.69831,555.692331 846.317257,557.120351 840.820736,557.851392 C832.813056,559.321856 821.211136,558.832384 821.211136,570.270464 Z M872.521728,622.402304 L875.937792,605.08032 L882.96448,605.08032 C892.276736,605.08032 897.50528,600.015616 897.50528,589.55648 C897.161289,583.220074 896.231628,576.929099 894.728192,570.764032 L882.644992,511.120128 L905.521152,511.120128 L911.241216,549.194496 C912.392192,556.874496 913.698816,568.150784 913.698816,568.150784 L914.026496,568.150784 C914.026496,568.150784 918.112256,557.038336 921.706496,549.194496 L939.02848,511.120128 L961.261568,511.120128 L917.94432,599.034624 C909.611008,615.865088 902.422528,622.402304 886.243328,622.402304 L872.521728,622.402304 Z M970.729472,480.80768 L971.669504,475.863808 L994.383872,475.863808 L993.44384,480.80768 L984.987648,480.80768 L980.289536,505.072384 L974.446592,505.072384 L979.144704,480.80768 L970.729472,480.80768 Z M990.298112,505.072384 L995.9424,475.863808 L1004.07296,475.863808 L1005.17683,490.283776 C1005.50451,494.367488 1005.54547,498.576128 1005.54547,498.576128 L1005.5721,498.576128 C1005.5721,498.576128 1006.87872,494.654208 1008.55398,491.019008 L1015.58067,475.863808 L1024,475.863808 L1018.36186,505.072384 L1012.92851,505.072384 L1016.15616,488.32384 C1016.64973,485.790464 1017.58976,482.196224 1017.58976,482.196224 L1017.50784,482.196224 C1017.50784,482.196224 1016.24218,485.335808 1015.09734,487.793408 L1007.0487,505.074432 L1001.49248,505.074432 L1000.10394,487.834368 C999.940096,485.677824 999.899136,482.196224 999.899136,482.196224 L999.817216,482.196224 C999.817216,482.196224 999.325696,485.954304 998.877184,488.32384 L995.649536,505.072384 L990.298112,505.072384 Z">
                </path>
            </svg>
        </div>
    </div>

    <div class="mid-container">
        <div class="info-box-container">
            <div class="info-box-wrapper">
                <h3 class="title">${t('moonpay:addPaymentMethod')}</h3>
                <span class="subtitle">${t('moonpay:pleaseEnterYourBillingDetails')}</span>
            </div>
        </div>

        <div class="field-container">
            <label for="cc-number" class="field-label">${t('moonpay:cardNumber')}</label>
            <span id="cc-number" class="form-field">
            </span>
        </div>

        <div class="field-container">
            <label for="cc-cvc" class="field-label">${t('moonpay:cvc')}</label>
            <span id="cc-cvc" class="form-field">
            </span>
        </div>

        <div class="field-container">
            <label for="cc-expiration-date" class="field-label">${t('moonpay:expirationDate')}</label>
            <span id="cc-expiration-date" class="form-field">
            </span>
        </div>

    </div>

    <div class="bottom-container">
        <div class="buttons-container">
            <input type="button" value=${t('global:back')} onclick="goBack()" class="button-left" />
            <button class="button-right" onclick="submit(event)">${t('global:submit')}</button>
        </div>
    </div>
</div>

  <script type="text/javascript" src="https://cdn.moonpay.io/moonpay-sdk.js"></script>

  <script>
  function goBack() {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'back'
    }));
  }

    moonpay.initialize("${API_KEY}", "${customerId}");

    moonpay.trackPageView();

    var isFormValid = false;
    var formState = {};

  document.body.addEventListener('touchstart', function(e) {
    document.activeElement.blur();
  });

    const form = moonpay.createCardDetailsForm(function(state) {
      formState = state;

      if (state && state.number && state.expiryDate && state.cvc) {
        isFormValid = state.number.isValid && state.expiryDate.isValid && state.cvc.isValid;
      }
     });

    // Create VGS Collect field for credit card number
    form.createField('#cc-number', {
      type: 'card-number',
      name: 'number',
      autoFocus: true,
      errorColor: "${theme.negative.color}",
      css: {
        color: "${theme.input.color}",
        fontSize: '16px',
        fontFamily: 'Source Sans Pro, sans-serif',
        fontWeight: 200
      },
      validations: ['required', 'validCardNumber'],
    });

    // Create VGS Collect field for CVC
    form.createField('#cc-cvc', {
      errorColor: "${theme.negative.color}",
      css: {
        color: "${theme.input.color}",
        fontSize: '16px',
        fontFamily: 'Source Sans Pro, sans-serif',
        fontWeight: 200
      },
      type: 'card-security-code',
      name: 'cvc',
      validations: ['required', 'validCardSecurityCode'],
    });

    // Create VGS Collect field for credit card expiration date
    form.createField('#cc-expiration-date', {
      type: 'card-expiration-date',
      name: 'expiryDate',
      errorColor: "${theme.negative.color}",
      css: {
        color: "${theme.input.color}",
        fontSize: '16px',
        fontFamily: 'Source Sans Pro, sans-serif',
        fontWeight: 200
      },
      placeholder: '01 / 2016',
      validations: ['required', 'validCardExpirationDate']
    });

    function submit(e) {
      e.preventDefault();

      if (isFormValid) {
        document.getElementsByClassName('button-right')[0].innerHTML = '<i class="fa ${
            isAndroid ? 'fa-circle-o-notch' : 'fa-spinner'
        } fa-spin"></i>';
        document.getElementsByClassName('button-left')[0].disabled = true;

        form.submit(
            {
                street: '${customerAddress.street}',
                subStreet: '${customerAddress.subStreet}',
                town: '${customerAddress.town}',
                postCode: '${customerAddress.postCode}',
                state: '${customerAddress.state}',
                country: '${customerAddress.country}',
            },
            function(status, data) {
                if (status.toString().startsWith('2')) {
                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                            type: 'success',
                            data: data,
                        }),
                    );
                } else {
                  document.getElementsByClassName('button-right')[0].innerHTML = "${t('global:submit')}";
                  document.getElementsByClassName('button-left')[0].disabled = false;

                    window.ReactNativeWebView.postMessage(
                        JSON.stringify({
                            type: 'error',
                            data: data,
                        }),
                    );
                }
            },
            function(errors) {
                document.getElementsByClassName('button-right')[0].innerHTML = "${t('global:submit')}";
                document.getElementsByClassName('button-left')[0].disabled = false;

                window.ReactNativeWebView.postMessage(
                    JSON.stringify({
                        type: 'error',
                        data: errors,
                    }),
                );
            },
        );
    } else {
        window.ReactNativeWebView.postMessage(
            JSON.stringify({
                type: 'submissionError',
                data: formState,
            }),
        );
      }
    }
  </script>
  </body>
  </html>`;
};

/**
 * (MoonPay) Add Payment Method
 */
class AddPaymentMethod extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        address: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        createPaymentCard: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        customerId: PropTypes.string.isRequired,
        /** @ignore */
        paymentCards: PropTypes.array.isRequired,
        /** @ignore */
        isCreatingPaymentCard: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorCreatingPaymentCard: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.onMessage = this.onMessage.bind(this);

        this.state = {
            loaded: false,
        };

        this.keyboardDidShow = this.keyboardDidShow.bind(this);
        this.keyboardDidHide = this.keyboardDidHide.bind(this);
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isCreatingPaymentCard && !nextProps.isCreatingPaymentCard) {
            const { t } = this.props;

            nextProps.hasErrorCreatingPaymentCard
                ? this.props.generateAlert(
                      'error',
                      t('moonpay:paymentCardCreationError'),
                      t('moonpay:paymentCardCreationErrorExplanation'),
                  )
                : this.redirectToScreen('reviewPurchase');

            this.webView.injectJavaScript(this.getJavaScriptToInject().buttons());
        }
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    /**
     * keyboardDidShow event callback handler
     *
     * @method keyboardDidShow
     *
     * @param {object} frames
     *
     * @returns {void}
     */
    keyboardDidShow(frames) {
        this.webView.injectJavaScript(
            this.getJavaScriptToInject().keyboard(
                height - frames.endCoordinates.height - Styling.footerButtonHeight - 150,
            ),
        );
    }

    /**
     * keyboardDidHide event callback handler
     *
     * @method keyboardDidHide
     *
     *
     * @returns {void}
     */
    keyboardDidHide() {
        this.webView.injectJavaScript(this.getJavaScriptToInject().keyboard(height));
    }

    /**
     * Gets JavaScript to inject to WebView
     *
     * @method getJavaScriptToInject
     *
     * @returns {void}
     */
    getJavaScriptToInject() {
        const { t } = this.props;

        return {
            buttons: () => `
          document.getElementsByClassName('button-right')[0].innerHTML = "${t('global:submit')}";
          document.getElementsByClassName('button-left')[0].disabled = false;
          true
        `,
            keyboard: (height) => `
          document.getElementsByClassName('container')[0].style.height = "${height}px";
          document.getElementsByClassName('container')[0].style.webkitTransition = "0.5s height";
          true
        `,
        };
    }

    /**
     * onMessage event callback method
     *
     * @method onMessage
     *
     * @param {object} event
     *
     * @returns {void}
     */
    onMessage(event) {
        const { paymentCards, t } = this.props;

        const message = parse(event.nativeEvent.data);

        const type = get(message, 'type');

        if (type === 'success') {
            if (
                some(paymentCards, (card) => {
                    return (
                        get(card, 'brand') === get(message, 'data.brand') &&
                        get(card, 'lastDigits') === get(message, 'data.lastDigits')
                    );
                })
            ) {
                this.webView.injectJavaScript(this.getJavaScriptToInject().buttons());
                this.props.generateAlert('error', t('moonpay:duplicateCard'), t('moonpay:duplicateCardExplanation'));
            } else {
                this.props.createPaymentCard(get(message, 'data.id'));
            }
        } else if (type === 'error') {
            this.props.generateAlert(
                'error',
                t('global:somethingWentWrong'),
                t('moonpay:somethingWentWrongProcessingCardInfo'),
            );
        } else if (type === 'submissionError') {
            const formState = get(message, 'data');

            if (!formState.number.isValid) {
                this.props.generateAlert(
                    'error',
                    t('moonpay:invalidCardNumber'),
                    t('moonpay:invalidCardNumberExplanation'),
                );
            } else if (!formState.cvc.isValid) {
                this.props.generateAlert('error', t('moonpay:invalidCvc'), t('moonpay:invalidCvcExplanation'));
            } else if (!formState.expiryDate.isValid) {
                this.props.generateAlert(
                    'error',
                    t('moonpay:invalidExpiryDate'),
                    t('moonpay:invalidExpiryDateExplanation'),
                );
            }
        } else if (type === 'back') {
            this.goBack();
        }
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    render() {
        const { address, customerId, theme, t } = this.props;

        return (
            <View style={{ flex: 1, backgroundColor: theme.body.bg }}>
                <WebView
                    ref={(ref) => (this.webView = ref)}
                    hideKeyboardAccessoryView
                    javaScriptEnabled
                    scrollEnabled={false}
                    style={this.state.loaded || { flex: 0, height: 0, opacity: 0 }}
                    source={{ html: renderHtml(theme, t, address, customerId) }}
                    onMessage={this.onMessage}
                    onLoad={() => {
                        this.setState({ loaded: true });
                    }}
                    bounces={false}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    address: getCustomerAddress(state),
    customerId: getCustomerId(state),
    paymentCards: getCustomerPaymentCards(state),
    isCreatingPaymentCard: state.exchanges.moonpay.isCreatingPaymentCard,
    hasErrorCreatingPaymentCard: state.exchanges.moonpay.hasErrorCreatingPaymentCard,
});

const mapDispatchToProps = {
    generateAlert,
    createPaymentCard,
};

export default withTranslation(['global'])(connect(mapStateToProps, mapDispatchToProps)(AddPaymentMethod));
