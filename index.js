const core = require('@actions/core');
const HarnessDeployment = require("./harness-deployment");

try {
  const harnessDeployment = new HarnessDeployment(
    core.getInput('webhookUrl'),
    core.getInput('application'),
    core.getInput('version'),
    core.getInput('services'),
    core.getInput('poll_for_deploy_completion')
  );

  harnessDeployment.start();
} catch (error) {
  core.setFailed(error.message);
}
