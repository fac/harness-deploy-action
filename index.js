const core = require("@actions/core");
const { sendHarnessDeployRequest } = require("./send-harness-deploy-request.js");
const { watchDeployment } = require("./watch-deployment.js");

const webhookUrl = core.getInput("webhookUrl");
const application = core.getInput("application");
const version = core.getInput("version");
const services = core.getInput("services");
const harnessApiKey = core.getInput("harnessApiKey");
const waitForDeploy = core.getBooleanInput("waitForDeploy");

console.log(`Deploying application:${application} (${services}) at ${version}`);

sendHarnessDeployRequest(webhookUrl, application, version, services)
  .then((response) => {
    console.log("Response from sendHarnessDeployRequest is:");
    console.log(response);
    const responseData = response.responseData;
    const messages = response.messages;

    messages.forEach((msg) => {
      core.info(msg);
      console.log(msg)
    });

    if (waitForDeploy) {
      core.info("Polling for Harness deploy status:");
      watchDeployment(response.data.apiUrl, harnessApiKey);
    }

    core.setOutput("harness_url", response.data.uiUrl);
  })
  .catch(({ error, message }) => {
    core.setOutput("error", error);
    core.setFailed(message);
  });
