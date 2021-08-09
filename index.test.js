test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
});

test('index runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const index = require('./index');

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application: () at ');
})