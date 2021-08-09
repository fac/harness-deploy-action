const core = require('@actions/core');
const github = require('@actions/github');
const http = require('https');

function do_the_response(statusCode, data) {
  const { uiUrl, error } = data;
  core.setOutput("harness_url", uiUrl);
  core.setOutput("error", error);

  const request_success = [200, 201, 400].includes( statusCode );
  const deploy_success = ['QUEUED', 'RUNNING', 'PAUSED'].includes( data.status );

  if ( request_success && deploy_success ) {
    if ( data.status == 'PAUSED' ) {
      core.info("⚠️ Waiting for approval to start the deployment pipeline on Harness")
    } else {
      core.info("🚀 Deployment pipeline is now running on Harness")
    }
    core.info(`Harness deploy submitted, view at ${uiUrl}`)
  } else {
    if ( error ) {
      core.error(`💣 Failed to start deployment: ${error}`)
    } else {
      core.error(`💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`)
    }

    core.setFailed(error || 'Unknown');
  }
}

function sendHarnessDeployRequest() {
  const webhookUrl = core.getInput('webhookUrl');
  const application = core.getInput('application');
  const version = core.getInput('version');
  const services = core.getInput('services');

  const art = services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: version } });
  const payload = JSON.stringify({
    application: application,
    artifacts: art
  }, undefined, 2)

  console.log(`Deploying application:${application} (${services}) at ${version}`)
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  }
  const req = http.request(webhookUrl, opts, (res) => {
    var body = ""
    res.setEncoding('utf8');
    res.on('error', (err) => {
      console.log(`ERROR: ${err}`);
      core.setFailed(err);
    });
    res.on('data', (chunk) => {
      body += chunk
    });
    res.on('end', () => {
      console.log(`BODY:${body}`);
      do_the_response(res.statusCode, JSON.parse(body));
    });
  });
  req.write(payload);
  req.end();
}

try {
  sendHarnessDeployRequest();
} catch (error) {
  core.setFailed(error.message);
}
