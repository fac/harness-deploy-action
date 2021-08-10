const index = require('./index');

test('index runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // since we're not setting up a webhook, this fails with Invalid URL
    try {
      index.sendHarnessDeployRequest(
        'http://example.com/',
        'pincushion',
        'v0',
        'foo, bar ,baz'
      );
    } catch { }

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application:pincushion (foo, bar ,baz) at v0');
})
