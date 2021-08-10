const core = require('@actions/core');
const {
  sendHarnessDeployRequest,
  makeHarnessDeployRequestPayload } = require('./index.js')

try {
  const webhookUrl = core.getInput('webhookUrl');
  const application = core.getInput('application');
  const version = core.getInput('version');
  const services = core.getInput('services');

  console.log(`Deploying application:${application} (${services}) at ${version}`)
  sendHarnessDeployRequest(
    webhookUrl,
    makeHarnessDeployRequestPayload(application, version, services)
  );
} catch (error) {
  core.setFailed(error.message);
}
