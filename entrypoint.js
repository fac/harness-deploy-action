const core = require('@actions/core');
const index = require('./index.js')

try {
  index.sendHarnessDeployRequest();
} catch (error) {
  core.setFailed(error.message);
}
