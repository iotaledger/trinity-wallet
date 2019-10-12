import React, { PureComponent } from 'react';
import { withTranslation } from 'react-i18next';
import navigator from 'libs/navigation';
import { connect } from 'react-redux';
import { StyleSheet, View, WebView } from 'react-native';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const VGSCollectFormHTMl = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>VGS Collect Credit Card Example</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">

    <!--Replace with generated for your organization JS file.-->
    <script type="text/javascript" src="https://js.verygoodvault.com/vgs-collect/1/ACwR8j4YLDecDMmyR1kddGfH.js"></script>

    <style>
      span[id*="cc-"] {
        display: block;
        height: 40px;
        margin-bottom: 15px;
      }

      span[id*="cc-"] iframe {
        height: 100%;
        width: 100%;
      }

      pre {
        font-size: 12px;
      }

      .form-field {
        display: block;
        width: 100%;
        height: calc(2.25rem + 2px);
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        color: #495057;
        background-color: #fff;
        background-clip: padding-box;
        border: 1px solid #ced4da;
        border-radius: .25rem;
        transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
      }

      .form-field iframe {
        border: 0 none transparent;
        height: 100%;
        vertical-align: middle;
        width: 100%;
      }

      p {
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
  <main>
    <div class="row">
      <div class="col-md-2"></div>
      <div class="col-md-4 mb-4">
        <div class="row card card-outline-secondary">
          <div class="card-body">
            <h3 class="text-center">Add a payment method</h3>
            <hr>
            <form id="cc-form">
              <div class="form-group">
                <label for="cc-number">Card number</label>
                <span id="cc-number" class="form-field">
                  <!--VGS Collect iframe for card number field will be here!-->
                </span>
              </div>
              <div class="form-group">
                <label for="cc-cvc">CVC</label>
                <span id="cc-cvc" class="form-field">
                <!--VGS Collect iframe for CVC field will be here!-->
                </span>
              </div>
              <div class="form-group">
                <label for="cc-expiration-date">Expiration date</label>
                <span id="cc-expiration-date" class="form-field">
                <!--VGS Collect iframe for expiration date field will be here!-->
                </span>
              </div>

              <!--Submit credit card form button-->
              <button type="submit" class="btn btn-success btn-block">Submit</button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-4 p-0">
        <div class="alert alert-warning">
          <h5 class="text-center">Response</h5>
          <pre id="result">
            Submit a form to see result.
          </pre>
        </div>
      </div>
    </div>
  </main>

  <!--Include script with VGS Collect form initialization-->
  <script>
    // VGS Collect form initialization
    const form = VGSCollect.create('tntzdhyyfg9', function(state) {});

    // Create VGS Collect field for credit card number
    form.field('#cc-number', {
      type: 'card-number',
      name: 'number',
      successColor: '#4F8A10',
      errorColor: '#D8000C',
      placeholder: '4111 1111 1111 1111',
      validations: ['required', 'validCardNumber'],
    });

    // Create VGS Collect field for CVC
    form.field('#cc-cvc', {
      type: 'card-security-code',
      name: 'cvc',
      placeholder: '344',
      validations: ['required', 'validCardSecurityCode'],
    });

    // Create VGS Collect field for credit card expiration date
    form.field('#cc-expiration-date', {
      type: 'card-expiration-date',
      name: 'expiryDate',
      placeholder: '01 / 2016',
      validations: ['required', 'validCardExpirationDate']
    });

    // Submits all of the form fields by executing a POST request.
    document.getElementById('cc-form')
      .addEventListener('submit', function(e) {
        e.preventDefault();
        form.submit('/v2/tokens?apiKey=pk_test_W1g4KpNvqWkHEo58O0CTluQz698eOc', {
            headers: {
                'Content-Type': 'application/json',
              }
        }, function(status, data) {
          document.getElementById('result').innerHTML = JSON.stringify(data, null, 4);
        });
      }, function (errors) {
        document.getElementById('result').innerHTML = errors;
      });
  </script>
  </body>
  </html>`;

/**
 * (MoonPay) Add Payment Method
 */
class AddPaymentMethod extends PureComponent {

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    render() {
        return (
            <View style={[styles.container]}>
                <WebView source={{ html: VGSCollectFormHTMl }} javaScriptEnabled />
                <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                    <DualFooterButtons
                        onLeftButtonPress={() => AddPaymentMethod.redirectToScreen('userAdvancedInfo')}
                        onRightButtonPress={() => {}}
                        leftButtonText="Go back"
                        rightButtonText="Continue"
                        leftButtonTestID="enterSeed-back"
                        rightButtonTestID="enterSeed-next"
                    />
                </AnimatedComponent>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default withTranslation(['global'])(connect(mapStateToProps)(AddPaymentMethod));
