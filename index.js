const core = require("@actions/core");
const { sendHarnessDeployRequest } = require("./send-harness-deploy-request.js");
const { watchDeployment } = require("./watch-deployment.js");

const webhookUrl = core.getInput("webhookUrl");
const application = core.getInput("application");
const version = core.getInput("version");
const services = core.getInput("services");
const harnessApiKey = core.getInput("harnessApiKey");
const waitForDeploy = core.getBooleanInput("waitForDeploy");

core.info(`Deploying application:${application} (${services}) at ${version}`);
sendHarnessDeployRequest(webhookUrl, application, version, services)
  .then(({ data, messages }) => {
    core.debug("Response from sendHarnessDeployRequest is:");
    core.debug(data);

    messages.forEach((msg) => {
      core.info(msg);
    });

    core.setOutput("harness_url", data.uiUrl);

    if (waitForDeploy) {
      core.info("Polling for Harness deploy status:");
      return watchDeployment(data.apiUrl, data.uiUrl, harnessApiKey).then(
        (message) => {
          core.info(message);
        }
      );
    }
  })
  .catch(({ error, message }) => {
    core.setOutput("error", error);
    core.setFailed(message);
  });
