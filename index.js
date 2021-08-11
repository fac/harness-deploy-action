const http = require('https');

export function checkHarnessDeployResponse(statusCode, data) {
  const { api_url, harness_url, error } = data;
  return new Promise((resolve, reject) => {
    const request_success = [200, 201, 400].includes( statusCode );
    const deploy_success = ['QUEUED', 'RUNNING', 'PAUSED'].includes( data.status );

    var info_message;
    if ( request_success && deploy_success ) {
      if ( data.status == 'PAUSED' ) {
        info_message = "⚠️ Waiting for approval to start the deployment pipeline on Harness";
      } else {
        info_message = "🚀 Deployment pipeline is now running on Harness";
      }
      resolve([harness_url, api_url, [info_message, `Harness deploy submitted, view at ${harness_url}`]]);
    } else {
      if ( error ) {
        reject([error, `💣 Failed to start deployment: ${error}`]);
      } else {
        reject([error, `💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`]);
      }
    }
  });
}

export function makeHarnessDeployRequestPayload(application, version, services) {
  const artifacts = services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: version } });
  return JSON.stringify({
    application,
    artifacts
  }, undefined, 2);
}

export function sendHarnessDeployRequest(webhookUrl, application, version, services) {
  const request_body = makeHarnessDeployRequestPayload(application, version, services);
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
      checkHarnessDeployResponse(res.statusCode, JSON.parse(body));
    });
  });
  req.write(request_body);
  req.end();
}
