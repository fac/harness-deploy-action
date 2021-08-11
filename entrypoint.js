const core = require('@actions/core');
const { sendHarnessDeployRequest, watchDeployment } = require('./index.js')

const webhookUrl = core.getInput('webhookUrl');
const application = core.getInput('application');
const version = core.getInput('version');
const services = core.getInput('services');
const harnessApiKey = core.getInput('harnessApiKey');
const waitForDeploy = core.getBooleanInput('waitForDeploy');

console.log(`Deploying application:${application} (${services}) at ${version}`)
sendHarnessDeployRequest(webhookUrl, application, version, services)
.then(([harness_url, api_url, messages]) => {
  core.setOutput('harness_url', harness_url);
  messages.forEach( (msg) => { core.info(msg) } );
  return api_url;
})
.then((api_url) => {
  if ( waitForDeploy ) {
    watchDeployment( api_url, harnessApiKey );
  }
})
.catch((error, message) => {
  core.setOutput('error', error);
  core.setFailed(message);
});
