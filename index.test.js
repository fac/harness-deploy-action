test('index runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const index = require('./index');

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application: () at ');
})