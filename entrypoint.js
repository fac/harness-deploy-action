const core = require('@actions/core');
const { sendHarnessDeployRequest } = require('./index.js')

const webhookUrl = core.getInput('webhookUrl');
const application = core.getInput('application');
const version = core.getInput('version');
const services = core.getInput('services');

console.log(`Deploying application:${application} (${services}) at ${version}`)
sendHarnessDeployRequest(webhookUrl, application, version, services)
.then(([harness_url, api_url, messages]) => {
  core.setOutput('harness_url', harness_url);
  messages.forEach( (msg) => { core.info(msg) } );
})
.catch((error, message) => {
  core.setOutput('error', error);
  core.setFailed(message);
});
