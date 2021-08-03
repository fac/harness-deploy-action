const core = require('@actions/core');
const HarnessDeployment = require("./harness-deployment");

let webhookUrl = "https://reqres.in/api/users";
let application = "test-application";
let version = "v1";
let services = "web, job";

test('a log message with the deployment information is created', async () => {
    const consoleSpy = jest.spyOn(console, 'log');

    const harnessDeployment = new HarnessDeployment(webhookUrl, application, version, services);
    harnessDeployment.makeRequest = jest.fn().mockReturnValue("made a request")
    const req = harnessDeployment.start();

    expect(consoleSpy).toHaveBeenCalledWith('Deploying application:test-application (web, job) at v1');
});

test('start() makes the correct POST request which is then procesed by do_the_response', () => {
    const mockSend = jest.fn();
    const mockOpen = jest.fn();
    const mocksetRequestHeader = jest.fn();
    const mockResponse = { test: 'response' }
    const mockResponseStatus = 200;

    const xhrMockClass = () => ({
        open: mockOpen,
        send: mockSend,
        setRequestHeader: mocksetRequestHeader,
        responseText: JSON.stringify(mockResponse),
        status: mockResponseStatus
    });
    XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)

    const harnessDeployment = new HarnessDeployment(webhookUrl, application, version, services);

    const mockDoTheResponse = jest.fn();

    const testPayload = "{test payload}"
    harnessDeployment.payload = jest.fn().mockReturnValue(testPayload)
    harnessDeployment.do_the_response = mockDoTheResponse

    const req = harnessDeployment.start();

    expect(mockSend).toHaveBeenCalledWith(testPayload);
    expect(mockDoTheResponse).toHaveBeenCalledWith(mockResponseStatus, mockResponse);
});
