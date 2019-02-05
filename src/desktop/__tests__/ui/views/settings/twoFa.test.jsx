describe('Settings two-factor authentication view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/twoFa', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'twoFa.test.jsx',
        });
    });
});
