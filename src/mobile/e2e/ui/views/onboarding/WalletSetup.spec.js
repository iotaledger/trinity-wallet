/*global expect element by*/
import { navigateToWalletSetup } from '../../../internal/statelessNavigation';

describe('WalletSetup', () => {
    it('should show the WalletSetup screen', async () => {
        await navigateToWalletSetup();
        await expect(element(by.id('walletSetup-thankYou'))).toBeVisible();
    });

    it('should have two footer buttons', async () => {
        await expect(element(by.id('walletSetup-no'))).toBeVisible();
        await expect(element(by.id('walletSetup-yes'))).toBeVisible();
    });
});
