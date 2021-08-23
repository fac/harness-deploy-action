const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

test('runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    process.env['INPUT_APPLICATION'] = 'pincushion';
    process.env['INPUT_SERVICES'] = 'pin, cush ,ion';
    process.env['INPUT_WEBHOOKURL'] = 'https://example.com/harness/webhook';
    process.env['INPUT_VERSION'] = 'v0';
    process.env['INPUT_WAITFORDEPLOY'] = 'false';

    const http_mock = new MockAdapter(axios);
    http_mock.onPost('https://example.com/harness/webhook')
    .reply(200, {
        api_url: 'https://example.org/api',
        harness_url: 'https://example.org/harness/execution',
        status: 'RUNNING'
    });

    const entrypoint = require('./entrypoint');

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application:pincushion (pin, cush ,ion) at v0');
})

test('polls', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    process.env['INPUT_APPLICATION'] = 'pincushion';
    process.env['INPUT_SERVICES'] = 'pin, cush ,ion';
    process.env['INPUT_WEBHOOKURL'] = 'https://example.com/harness/webhook';
    process.env['INPUT_VERSION'] = 'v0';
    process.env['INPUT_WAITFORDEPLOY'] = 'true';

    const http_mock = new MockAdapter(axios);
    http_mock.onPost('https://example.com/harness/webhook')
    .reply(200, {
        api_url: 'https://example.org/api',
        harness_url: 'https://example.org/harness/execution',
        status: 'RUNNING'
    });

    http_mock.onGet('https://example.org/api')
    .reply(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .reply(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .reply(200, {
      status: 'SUCCESS',
    });

    const entrypoint = require('./entrypoint');
    expect(consoleSpy).toHaveBeenCalledWith('Deploying application:pincushion (pin, cush ,ion) at v0');
});
