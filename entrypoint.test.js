test('runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    process.env['INPUT_APPLICATION'] = 'pincushion';
    process.env['INPUT_SERVICES'] = 'pin, cush ,ion';
    process.env['INPUT_WEBHOOKURL'] = 'https://example.com/harness/webhook';
    process.env['INPUT_VERSION'] = 'v0';
    process.env['INPUT_WAITFORDEPLOY'] = 'false';

    const action = require('./entrypoint');

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application:pincushion (pin, cush ,ion) at v0');
})
