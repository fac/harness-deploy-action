const { watchDeployment } = require("./watch-deployment.js");

const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

describe("watchDeployment", () => {
  test("polling on a successful deployment", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "SUCCESS",
      });

    return watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
      waitBetween: 0.1,
    }).then((result) => {
      expect(result).toBe("🎉 Deployment succeeded");
    });
  });

  test("polling hitting the timeout", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "SUCCESS",
      });

    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.5,
        timeLimit: 0.01,
      })
    ).rejects.toEqual("Time limit of 0.01 hit!");
  });

  test("polling ends when deployment failed", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "FAILED",
      });
    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
    ).rejects.toMatchObject({
      error: "FAILED",
      message: expect.stringContaining("Deployment has failed"),
    });
  });

  test("polling ends when deployment aborted", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "ABORTED",
      });

    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
    ).rejects.toMatchObject({
      error: "ABORTED",
      message: expect.stringContaining("Deployment was aborted"),
    });
  });

  test("polling ends when deployment rejected", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "REJECTED",
      });

    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
    ).rejects.toMatchObject({
      error: "REJECTED",
      message: expect.stringContaining("Deployment was rejected"),
    });
  });

  test("polling ends when status is unknown", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "UH OH",
      });

    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
    ).rejects.toMatchObject({
      error: "UH OH",
      message: expect.stringContaining("Unknown status from Harness: UH OH."),
    });
  });

  test("polling ends when unexpected HTTP status in response", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "QUEUED",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "UNEXPECTED",
      });

    return expect(
      watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
    ).rejects.toMatchObject({
      error: "UNEXPECTED",
      message: expect.stringContaining(
        "Unknown status from Harness: UNEXPECTED. Please check deployment link to see what happened and confirm everything's ok."
      ),
    });
  });

  test("polling retries on known HTTP error status (408)", () => {
    expect.assertions(1);

    const http_mock = new MockAdapter(axios);
    http_mock
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "RUNNING",
      })
      .onGet("https://example.org/api")
      .replyOnce(408, {
        status: "KNOWN_HTTP_STATUS_CODE",
      })
      .onGet("https://example.org/api")
      .replyOnce(200, {
        status: "SUCCESS",
      });

    return watchDeployment("https://example.org/api", "HARNESS_TEST_API_KEY", {
        waitBetween: 0.1,
      })
      .then((result) => {
        expect(result).toBe("🎉 Deployment succeeded");
      });
  });
});
