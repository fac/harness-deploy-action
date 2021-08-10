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
