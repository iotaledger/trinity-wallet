import { Navigation } from 'react-native-navigation';
import withSafeAreaView from 'ui/components/SafeAreaView';
import withDropdownAlert from 'ui/components/WithDropdownAlert';
import withModal from 'ui/components/ModalComponent';
import withStatusBar from 'ui/components/WithStatusBar';
import withBackPress from 'ui/components/BackPress';
import withKeyboardMonitor from 'ui/components/KeyboardMonitor';
import Home from 'ui/views/wallet/Home';
import Loading from 'ui/views/wallet/Loading';
import NewSeedSetup from 'ui/views/onboarding/NewSeedSetup';
import Welcome from 'ui/views/onboarding/Welcome';
import WalletSetup from 'ui/views/onboarding/WalletSetup';
import LanguageSetup from 'ui/views/onboarding/LanguageSetup';
import EnterSeed from 'ui/views/onboarding/EnterSeed';
import SaveYourSeed from 'ui/views/onboarding/SaveYourSeed';
import SetPassword from 'ui/views/onboarding/SetPassword';
import PrintBlankTemplate from 'ui/views/onboarding/PrintBlankTemplate';
import WriteSeedDown from 'ui/views/onboarding/WriteSeedDown';
import SaveSeedConfirmation from 'ui/views/onboarding/SaveSeedConfirmation';
import Login from 'ui/views/wallet/Login';
import WalletResetConfirmation from 'ui/views/wallet/WalletResetConfirmation';
import WalletResetRequirePassword from 'ui/views/wallet/WalletResetRequirePassword';
import OnboardingComplete from 'ui/views/onboarding/OnboardingComplete';
import SetAccountNameComponent from 'ui/views/onboarding/SetAccountName';
import SeedReentry from 'ui/views/onboarding/SeedReentry';
import BiometricAuthentication from 'ui/views/wallet/BiometricAuthentication';
import TermsAndConditions from 'ui/views/onboarding/TermsAndConditions';
import PrivacyPolicy from 'ui/views/onboarding/PrivacyPolicy';
import ForceChangePassword from 'ui/views/wallet/ForceChangePassword';
import SeedVaultBackupComponent from 'ui/views/onboarding/SeedVaultBackup';
import MigrationComponent from 'ui/components/Migration';
import InactivityLogout from 'ui/views/wallet/InactivityLogout';

// MoonPay routes
import MoonPayLandingComponent from 'ui/views/wallet/exchanges/MoonPay/Landing';
import MoonPayAddAmountComponent from 'ui/views/wallet/exchanges/MoonPay/AddAmount';
import MoonPaySelectAccount from 'ui/views/wallet/exchanges/MoonPay/SelectAccount';
import MoonPaySetupEmail from 'ui/views/wallet/exchanges/MoonPay/SetupEmail';
import MoonPayVerifyEmail from 'ui/views/wallet/exchanges/MoonPay/VerifyEmail';
import MoonPayUserBasicInfo from 'ui/views/wallet/exchanges/MoonPay/UserBasicInfo';
import MoonPayUserAdvancedInfo from 'ui/views/wallet/exchanges/MoonPay/UserAdvancedInfo';
import MoonPayAddPaymentMethod from 'ui/views/wallet/exchanges/MoonPay/AddPaymentMethod';
import MoonPayReviewPurchase from 'ui/views/wallet/exchanges/MoonPay/ReviewPurchase';
import MoonPayPurchaseReceipt from 'ui/views/wallet/exchanges/MoonPay/PurchaseReceipt';
import MoonPayPurchaseLimitWarning from 'ui/views/wallet/exchanges/MoonPay/PurchaseLimitWarning';
import MoonPayIdentityConfirmationWarning from 'ui/views/wallet/exchanges/MoonPay/IdentityConfirmationWarning';
import MoonPaySelectPaymentCard from 'ui/views/wallet/exchanges/MoonPay/SelectPaymentCard';

import MoonPayPaymentSuccess from 'ui/views/wallet/exchanges/MoonPay/PaymentSuccess';
import MoonPayPaymentFailure from 'ui/views/wallet/exchanges/MoonPay/PaymentFailure';
import MoonPayPaymentPending from 'ui/views/wallet/exchanges/MoonPay/PaymentPending';

import { isIPhoneX, isAndroid } from 'libs/device';

function applyHOCs(screen) {
    const withHOCs = (c) => withKeyboardMonitor(withDropdownAlert(withStatusBar(withModal(c))));
    if (isIPhoneX) {
        return withHOCs(withSafeAreaView(screen));
    }
    if (isAndroid) {
        return withBackPress(withHOCs(screen));
    }
    return withHOCs(screen);
}

export default function registerScreens(store, Provider) {
    // MoonPay routes registration
    Navigation.registerComponentWithRedux('landing', () => applyHOCs(MoonPayLandingComponent), Provider, store);
    Navigation.registerComponentWithRedux('addAmount', () => applyHOCs(MoonPayAddAmountComponent), Provider, store);
    Navigation.registerComponentWithRedux('selectAccount', () => applyHOCs(MoonPaySelectAccount), Provider, store);
    Navigation.registerComponentWithRedux('setupEmail', () => applyHOCs(MoonPaySetupEmail), Provider, store);
    Navigation.registerComponentWithRedux('verifyEmail', () => applyHOCs(MoonPayVerifyEmail), Provider, store);
    Navigation.registerComponentWithRedux('userBasicInfo', () => applyHOCs(MoonPayUserBasicInfo), Provider, store);
    Navigation.registerComponentWithRedux(
        'userAdvancedInfo',
        () => applyHOCs(MoonPayUserAdvancedInfo),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'addPaymentMethod',
        () => applyHOCs(MoonPayAddPaymentMethod),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('reviewPurchase', () => applyHOCs(MoonPayReviewPurchase), Provider, store);
    Navigation.registerComponentWithRedux('purchaseReceipt', () => applyHOCs(MoonPayPurchaseReceipt), Provider, store);
    Navigation.registerComponentWithRedux(
        'purchaseLimitWarning',
        () => applyHOCs(MoonPayPurchaseLimitWarning),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'identityConfirmationWarning',
        () => applyHOCs(MoonPayIdentityConfirmationWarning),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'selectPaymentCard',
        () => applyHOCs(MoonPaySelectPaymentCard),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('paymentSuccess', () => applyHOCs(MoonPayPaymentSuccess), Provider, store);
    Navigation.registerComponentWithRedux('paymentFailure', () => applyHOCs(MoonPayPaymentFailure), Provider, store);
    Navigation.registerComponentWithRedux('paymentPending', () => applyHOCs(MoonPayPaymentPending), Provider, store);

    Navigation.registerComponentWithRedux('migration', () => applyHOCs(MigrationComponent), Provider, store);
    Navigation.registerComponentWithRedux('home', () => applyHOCs(Home), Provider, store);
    Navigation.registerComponentWithRedux('inactivityLogout', () => applyHOCs(InactivityLogout), Provider, store);
    Navigation.registerComponentWithRedux('loading', () => applyHOCs(Loading), Provider, store);
    Navigation.registerComponentWithRedux('newSeedSetup', () => applyHOCs(NewSeedSetup), Provider, store);
    Navigation.registerComponentWithRedux('welcome', () => applyHOCs(Welcome), Provider, store);
    Navigation.registerComponentWithRedux('walletSetup', () => applyHOCs(WalletSetup), Provider, store);
    Navigation.registerComponentWithRedux('enterSeed', () => applyHOCs(EnterSeed), Provider, store);
    Navigation.registerComponentWithRedux('saveYourSeed', () => applyHOCs(SaveYourSeed), Provider, store);
    Navigation.registerComponentWithRedux('setPassword', () => applyHOCs(SetPassword), Provider, store);
    Navigation.registerComponentWithRedux('login', () => applyHOCs(Login), Provider, store);
    Navigation.registerComponentWithRedux('writeSeedDown', () => applyHOCs(WriteSeedDown), Provider, store);
    Navigation.registerComponentWithRedux('printBlankTemplate', () => applyHOCs(PrintBlankTemplate), Provider, store);
    Navigation.registerComponentWithRedux('languageSetup', () => applyHOCs(LanguageSetup), Provider, store);
    Navigation.registerComponentWithRedux(
        'walletResetConfirm',
        () => applyHOCs(WalletResetConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'walletResetRequirePassword',
        () => applyHOCs(WalletResetRequirePassword),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('onboardingComplete', () => applyHOCs(OnboardingComplete), Provider, store);
    Navigation.registerComponentWithRedux('setAccountName', () => applyHOCs(SetAccountNameComponent), Provider, store);
    Navigation.registerComponentWithRedux('seedReentry', () => applyHOCs(SeedReentry), Provider, store);
    Navigation.registerComponentWithRedux(
        'saveSeedConfirmation',
        () => applyHOCs(SaveSeedConfirmation),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux(
        'biometricAuthentication',
        () => applyHOCs(BiometricAuthentication),
        Provider,
        store,
    );
    Navigation.registerComponentWithRedux('termsAndConditions', () => applyHOCs(TermsAndConditions), Provider, store);
    Navigation.registerComponentWithRedux('privacyPolicy', () => applyHOCs(PrivacyPolicy), Provider, store);
    Navigation.registerComponentWithRedux('forceChangePassword', () => applyHOCs(ForceChangePassword), Provider, store);
    Navigation.registerComponentWithRedux(
        'seedVaultBackup',
        () => applyHOCs(SeedVaultBackupComponent),
        Provider,
        store,
    );
}
