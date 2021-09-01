const axios = require("axios");
const core = require("@actions/core");
const MockAdapter = require("axios-mock-adapter");

const { watchDeployment } = require("./watch-deployment.js");

describe("the JS entrypoint to the GitHub action", () => {
  test("runs the action", () => {
    expect.assertions(1);

    const coreSpy = jest.spyOn(core, "info");

    process.env["INPUT_APPLICATION"] = "pincushion";
    process.env["INPUT_SERVICES"] = "pin, cush ,ion";
    process.env["INPUT_WEBHOOKURL"] = "https://example.com/harness/webhook";
    process.env["INPUT_VERSION"] = "v0";
    process.env["INPUT_WAITFORDEPLOY"] = "false";

    const http_mock = new MockAdapter(axios);
    http_mock.onPost("https://example.com/harness/webhook").reply(200, {
      requestId: "req123",
      status: "RUNNING",
      error: null,
      uiUrl:
        "app.harness.io/#/account/aaa/app/bbb/pipeline-execution/ccc/workflow-execution/undefined/details",
      apiUrl:
        "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc",
      message: null,
    });

    const entrypoint = require("./index.js");

    expect(coreSpy).toHaveBeenCalledWith(
      "Deploying application:pincushion (pin, cush ,ion) at v0"
    );
  });

  test("runs the action and waits for deploy", () => {
    // expect.assertions(1);

    const coreSpy = jest.spyOn(core, "info");

    process.env["INPUT_APPLICATION"] = "pincushion";
    process.env["INPUT_SERVICES"] = "pin, cush ,ion";
    process.env["INPUT_WEBHOOKURL"] = "https://example.com/harness/webhook";
    process.env["INPUT_VERSION"] = "v0";
    process.env["INPUT_WAITFORDEPLOY"] = "true";

    const http_mock = new MockAdapter(axios);
    http_mock.onPost("https://example.com/harness/webhook").reply(200, {
      requestId: "req123",
      status: "RUNNING",
      error: null,
      uiUrl:
        "app.harness.io/#/account/aaa/app/bbb/pipeline-execution/ccc/workflow-execution/undefined/details",
      apiUrl:
        "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc",
      message: null,
    });

    http_mock
      .onGet(
        "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc"
      )
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet(
        "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc"
      )
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet(
        "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc"
      )
      .replyOnce(200, {
        status: "SUCCESS",
      });

    const entrypoint = require("./index.js");

    expect(coreSpy.mock.calls).toEqual([
      ["Deploying application:pincushion (pin, cush ,ion) at v0"],
      ["Sending request to start deployment"],
      ["Checking response from request to start deployment"],
      ["🚀 Deployment pipeline is now running on Harness"],
      [
        "Harness deploy submitted, view at app.harness.io/#/account/aaa/app/bbb/pipeline-execution/ccc/workflow-execution/undefined/details",
      ],
    ]);
  });
});
