const axios = require("axios").default;
const core = require("@actions/core");

let watchDeployment = function (api_url, harness_api_key, options = {}) {
  const { waitBetween, timeLimit } = Object.assign(
    { waitBetween: 10, timeLimit: 1200 },
    options
  );
  const retry_statuses = [408, 429, 503];
  const client = axios.create({
    maxRedirects: 0,
    headers: { "X-Api-Key": harness_api_key },
  });

  function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  function poll() {
    return client
      .get(api_url, {
        validateStatus: function (status) {
          const validateStatuses = retry_statuses.concat([200]);
          return validateStatuses.includes(status);
        },
      })
      .then(function (response) {
        // handle API GET request success
        core.info(`Deploy status: ${response.data.status}`);

        if (retry_statuses.includes(response.status)) {
          core.info(
            `Response HTTP status: ${response.status}, retrying poll..`
          );
          return sleep(waitBetween).then(poll);
        }

        const deployment_status = response.data.status;
        switch (deployment_status) {
          case "RUNNING":
          case "QUEUED":
            return sleep(waitBetween).then(poll);
          case "SUCCESS":
            return "🎉 Deployment succeeded";
          case "ABORTED":
            return Promise.reject({
              error: deployment_status,
              message: "🛑 Deployment was aborted or cancelled",
            });
          case "REJECTED":
            return Promise.reject({
              error: deployment_status,
              message: "🛑 Deployment was rejected",
            });
          case "FAILED":
            return Promise.reject({
              error: deployment_status,
              message:
                "💣 Deployment has failed. Check the Harness link for more details and see https://www.notion.so/freeagent/Deployment-failures-8ef5762f707944a4b880a8970cf16132 for help identifying the issue.",
            });
          default:
            return Promise.reject({
              error: deployment_status,
              message: `Unknown status from Harness: ${deployment_status}. Please check deployment link to see what happened and confirm everything's ok.`,
            });
        }
      })
      .catch(function (error) {
        // handle error
        core.info("polling response error:");
        core.info(JSON.stringify(error, null, 2));

        return Promise.reject({
          error: error.error,
          message: error.message,
        });
      });
  }

  return Promise.race([
    poll(),
    sleep(timeLimit).then(() =>
      Promise.reject(`Time limit of ${timeLimit} hit!`)
    ),
  ]);
};

module.exports = { watchDeployment };
