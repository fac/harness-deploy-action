const core = require('@actions/core');
const index = require('./index.js')

try {
  const webhookUrl = core.getInput('webhookUrl');
  const application = core.getInput('application');
  const version = core.getInput('version');
  const services = core.getInput('services');

  index.sendHarnessDeployRequest(webhookUrl, application, version, services);
} catch (error) {
  core.setFailed(error.message);
}
