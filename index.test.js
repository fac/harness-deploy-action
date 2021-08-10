const index = require('./index');

test('index runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    // since we're not setting up a webhook, this fails with Invalid URL
    try {
      index.sendHarnessDeployRequest();
    } catch { }

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application: () at ');
})
