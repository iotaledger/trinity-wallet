describe('Settings password view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/password', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'password.test.jsx',
        });
    }, 10000);
});
