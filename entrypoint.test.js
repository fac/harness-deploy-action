test('runs the action', () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const action = require('./entrypoint');

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application: () at ');
})
