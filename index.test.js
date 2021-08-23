const index = require('./index');

test('can create Harness payload', () => {
    const payload = index.makeHarnessDeployRequestPayload(
        'pincushion',
        'v0',
        'foo, bar ,baz'
    );
    expect(payload).toBe(
`{
  "application": "pincushion",
  "artifacts": [
    {
      "service": "foo",
      "buildNumber": "v0"
    },
    {
      "service": "bar",
      "buildNumber": "v0"
    },
    {
      "service": "baz",
      "buildNumber": "v0"
    }
  ]
}`);
})

function makeDeployResponseBody(extras={}) {
    return Object.assign({
        api_url: 'https://example.org/api',
        harness_url: 'https://example.org/harness/execution',
        status: 'RUNNING'
    }, extras);
}

test('handles successful deploy request', () => {
    return index.checkHarnessDeployResponse(200, makeDeployResponseBody())
    .then(({harness_url, api_url, messages}) => {
        expect(messages).toContain(
            '🚀 Deployment pipeline is now running on Harness'
        );
    });
});

test('handles paused deploy request', () => {
    return index.checkHarnessDeployResponse(200, makeDeployResponseBody({status: 'PAUSED'}))
    .then(({harness_url, api_url, messages}) => {
        expect(messages).toContain(
            '⚠️ Waiting for approval to start the deployment pipeline on Harness'
        );
    });
});

test('handles queued deploy request', () => {
    return index.checkHarnessDeployResponse(200, makeDeployResponseBody({status: 'QUEUED'}))
    .then(({harness_url, api_url, messages}) => {
        expect(messages).toContain(
            'Harness deploy submitted, view at https://example.org/harness/execution'
        );
    });
});

test('handles created status code', () => {
    return index.checkHarnessDeployResponse(201, makeDeployResponseBody());
});

test('handles bad request status code', () => {
    return index.checkHarnessDeployResponse(400, makeDeployResponseBody());
});

test('fails on other deployment statuses', () => {
    return expect(
        index.checkHarnessDeployResponse(200, makeDeployResponseBody({status: 'UH OH', error: 'whoops'}))
    ).rejects.toEqual({
        error: 'whoops',
        message: '💣 Failed to start deployment: whoops'
    });
});

test('fails on other HTTP statuses', () => {
    return expect(
        index.checkHarnessDeployResponse(100, makeDeployResponseBody({error: 'whoops'}))
    ).rejects.toEqual({
        error: 'whoops',
        message: '💣 Failed to start deployment: whoops'
    });
});

test('only shows error if it is set', () => {
    return expect(
        index.checkHarnessDeployResponse(100, makeDeployResponseBody({status: 'UH OH'}))
    ).rejects.toEqual({
        error: undefined,
        message: '💣 Deployment pipeline state is UH OH, check the health through the Harness website.'
    });
});
