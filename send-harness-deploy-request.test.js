const {
  makeHarnessDeployRequestPayload,
  checkHarnessDeployResponse,
} = require("./send-harness-deploy-request.js");

const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

describe("Harness deployment function", () => {
  describe("makeHarnessDeployRequestPayload", () => {
    test("generating HTTP payload to send to Harness", () => {
      expect.assertions(1);

      const payload = makeHarnessDeployRequestPayload(
        "pincushion",
        "v1",
        "foo, bar ,baz"
      );
      expect(payload).toBe(
        `{
  "application": "pincushion",
  "artifacts": [
    {
      "service": "foo",
      "buildNumber": "v1"
    },
    {
      "service": "bar",
      "buildNumber": "v1"
    },
    {
      "service": "baz",
      "buildNumber": "v1"
    }
  ]
}`
      );
    });
  });

  describe("checkHarnessDeployResponse", () => {
    function makeDeployResponseBody(extras = {}) {
      return Object.assign(
        {
          requestId: "req123",
          status: "RUNNING",
          error: null,
          uiUrl:
            "app.harness.io/#/account/aaa/app/bbb/pipeline-execution/ccc/workflow-execution/undefined/details",
          apiUrl:
            "app.harness.io/api/external/v1/executions/aaa/status?accountId=bbb&appId=ccc",
          message: null,
        },
        extras
      );
    }

    test("handles successful deploy request", () => {
      expect.assertions(1);

      return checkHarnessDeployResponse(200, makeDeployResponseBody()).then(
        ({ harness_url, api_url, messages }) => {
          expect(messages).toContain(
            "🚀 Deployment pipeline is now running on Harness"
          );
        }
      );
    });

    test("handles paused deploy request", () => {
      expect.assertions(1);

      return checkHarnessDeployResponse(
        200,
        makeDeployResponseBody({ status: "PAUSED" })
      ).then(({ harness_url, api_url, messages }) => {
        expect(messages).toContain(
          "⚠️ Waiting for approval to start the deployment pipeline on Harness"
        );
      });
    });

    test("handles queued deploy request", () => {
      expect.assertions(1);

      return checkHarnessDeployResponse(
        200,
        makeDeployResponseBody({ status: "QUEUED" })
      ).then(({ harness_url, api_url, messages }) => {
        expect(messages).toContain(
          "Harness deploy submitted, view at app.harness.io/#/account/aaa/app/bbb/pipeline-execution/ccc/workflow-execution/undefined/details"
        );
      });
    });

    test("handles created status code", () => {
      expect.assertions(1);

      return checkHarnessDeployResponse(
        201,
        makeDeployResponseBody({ status: "RUNNING" })
      ).then(({ harness_url, api_url, messages }) => {
        expect(messages).toContain(
          "🚀 Deployment pipeline is now running on Harness"
        );
      });
    });

    test("handles bad request status code", () => {
      expect.assertions(1);

      return checkHarnessDeployResponse(
        400,
        makeDeployResponseBody({ status: "QUEUED" })
      ).then(({ harness_url, api_url, messages }) => {
        expect(messages).toContain(
          "🚀 Deployment pipeline is now running on Harness"
        );
      });
    });

    test("fails on other deployment statuses", () => {
      expect.assertions(1);

      return expect(
        checkHarnessDeployResponse(
          200,
          makeDeployResponseBody({ status: "UH OH", error: "whoops" })
        )
      ).rejects.toEqual({
        error: "whoops",
        message: "💣 Failed to start deployment: whoops",
      });
    });

    test("fails on other HTTP statuses", () => {
      expect.assertions(1);

      return expect(
        checkHarnessDeployResponse(
          100,
          makeDeployResponseBody({ error: "whoops" })
        )
      ).rejects.toEqual({
        error: "whoops",
        message: "💣 Failed to start deployment: whoops",
      });
    });

    test("only shows error if it is set", () => {
      expect.assertions(1);

      return expect(
        checkHarnessDeployResponse(
          100,
          makeDeployResponseBody({ status: "UH OH" })
        )
      ).rejects.toEqual({
        error: null,
        message:
          "💣 Deployment pipeline state is UH OH, check the health through the Harness website.",
      });
    });
  });
});
