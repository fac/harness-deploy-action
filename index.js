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
  .then(({ responseData, messages }) => {
    core.setOutput("harness_url", responseData.uiUrl);
    core.setOutput("harness_api_url", responseData.apiUrl);
    messages.forEach((msg) => {
      core.info(msg);
    });
    return responseData.apiUrl;
  })
  .then((apiUrl) => {
    if (waitForDeploy) {
      console.log("watching deployment");
      watchDeployment(apiUrl, harnessApiKey);
    }
  })
  .catch(({ error, message }) => {
    core.setOutput("error", error);
    core.setFailed(message);
  });
