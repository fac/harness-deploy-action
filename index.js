const core = require('@actions/core');
const http = require('https');

function do_the_response(statusCode, data) {
  const { harness_url, error } = data;
  core.setOutput("harness_url", harness_url);
  core.setOutput("error", error);

  const request_success = [200, 201, 400].includes( statusCode );
  const deploy_success = ['QUEUED', 'RUNNING', 'PAUSED'].includes( data.status );

  if ( request_success && deploy_success ) {
    if ( data.status == 'PAUSED' ) {
      core.info("⚠️ Waiting for approval to start the deployment pipeline on Harness")
    } else {
      core.info("🚀 Deployment pipeline is now running on Harness")
    }
    core.info(`Harness deploy submitted, view at ${harness_url}`)
  } else {
    if ( error ) {
      core.error(`💣 Failed to start deployment: ${error}`)
    } else {
      core.error(`💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`)
    }

    core.setFailed(error || 'Unknown');
  }
}

export function makeHarnessDeployRequestPayload(application, version, services) {
  const artifacts = services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: version } });
  return JSON.stringify({
    application,
    artifacts
  }, undefined, 2);
}

export function sendHarnessDeployRequest(webhookUrl, request_body) {
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
  req.write(request_body);
  req.end();
}
