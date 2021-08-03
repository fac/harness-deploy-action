const core = require('@actions/core');
const HarnessDeployment = require("./harness-deployment");

try {
  const harnessDeployment = new HarnessDeployment
  harnessDeployment.start(
    core.getInput('webhookUrl'),
    core.getInput('application'),
    core.getInput('version'),
    core.getInput('services')
  );
} catch (error) {
  core.setFailed(error.message);
}
