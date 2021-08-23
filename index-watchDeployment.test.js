const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const index = require('./index');

test('polls', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'SUCCESS',
    });

    return index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 });

});

test('polling ends when deployment failed', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'FAILED',
    });

    return expect(
      index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 })
    ).rejects.toMatchObject({
      message: expect.stringContaining('Deployment has failed'),
    });
});

test('polling ends when deployment aborted', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'ABORTED',
    });

    return expect(
      index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 })
    ).rejects.toMatchObject({
      error: 'ABORTED',
      message: expect.stringContaining('Deployment was aborted'),
    });
});

test('polling ends when deployment rejected', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'REJECTED',
    });

    return expect(
      index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 })
    ).rejects.toMatchObject({
      error: 'REJECTED',
      message: expect.stringContaining('Deployment was rejected'),
    });
});

test('polling ends when status is unknown', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'UH OH',
    });

    return expect(
      index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 })
    ).rejects.toMatchObject({
      error: 'UH OH',
      message: expect.stringContaining('Unknown status from Harness: UH OH.'),
    });
});

test('polling ends when unexpected HTTP status in response', () => {
    const http_mock = new MockAdapter(axios);

    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'QUEUED',
    })
    .onGet('https://example.org/api')
    .replyOnce(201, {
      status: 'RUNNING',
    });

    index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 })
});

test('polling retries on known HTTP error status', () => {
    // const http_mock = new MockAdapter(axios);
    const http_mock = new MockAdapter(axios, { onNoMatch: "throwException" });


    http_mock.onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'RUNNING',
    })
    .onGet('https://example.org/api')
    .replyOnce(408, {})
    .onGet('https://example.org/api')
    .replyOnce(200, {
      status: 'SUCCESS',
    });

    return index.watchDeployment('https://example.org/api', 'HARNESS_TEST_API_KEY', { waitBetween: 0.1 });
});
