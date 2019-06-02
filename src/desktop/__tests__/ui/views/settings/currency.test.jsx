describe('Settings currency view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/currency', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'currency.test.jsx',
        });
    }, 10000);
});
