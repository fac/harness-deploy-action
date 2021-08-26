const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

describe("the JS entrypoint to the GitHub action", () => {
  test("runs the action", () => {
    expect.assertions(1);

    const consoleSpy = jest.spyOn(console, "log");

    process.env["INPUT_APPLICATION"] = "pincushion";
    process.env["INPUT_SERVICES"] = "pin, cush ,ion";
    process.env["INPUT_WEBHOOKURL"] = "https://example.com/harness/webhook";
    process.env["INPUT_VERSION"] = "v0";
    process.env["INPUT_WAITFORDEPLOY"] = "false";

    const http_mock = new MockAdapter(axios);
    http_mock.onPost("https://example.com/harness/webhook").reply(200, {
      api_url: "https://example.org/api",
      harness_url: "https://example.org/harness/execution",
      status: "RUNNING",
    });

    const entrypoint = require(".");

    expect(consoleSpy).toHaveBeenCalledWith(
      "Deploying application:pincushion (pin, cush ,ion) at v0"
    );
  });
});
