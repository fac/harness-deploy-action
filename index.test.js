let HarnessDeployment = require("./harness-deployment");
jest.mock("./harness-deployment");

test('calls harnessDeployment with the passed args', () => {
    const startSpy = jest.spyOn(HarnessDeployment.prototype, 'start');

    process.env['INPUT_APPLICATION'] = "Test Application";
    process.env['INPUT_SERVICES'] = "web, job";
    process.env['INPUT_WEBHOOKURL'] = "https://www.examplewebhookurl.com";
    process.env['INPUT_VERSION'] = "v1";
    process.env['INPUT_POLL_FOR_DEPLOY_COMPLETION'] = "true";

    const index = require('./index.js');

    expect(HarnessDeployment).toHaveBeenCalledWith(
        "https://www.examplewebhookurl.com", "Test Application", "v1", "web, job", "true"
    );

    expect(startSpy).toHaveBeenCalledTimes(1);
});
