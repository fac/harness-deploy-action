const axios = require("axios").default;

let watchDeployment = function (api_url, harness_api_key, options = {}) {
  console.log("watching deployment");

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
    console.log("polling...");
    return client
      .get(api_url, {
        validateStatus: function (status) {
          const validateStatuses = retry_statuses.concat([200]);
          return validateStatuses.includes(status);
        },
      })
      .then(function (response) {
        // handle API GET request success
        console.log("polling response success");
        console.log(response);

        if (retry_statuses.includes(response.status)) {
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
        console.log("polling response error");
        console.log(error);

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
