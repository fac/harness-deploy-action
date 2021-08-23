const axios = require('axios').default;

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
  const request = axios.post(webhookUrl, request_body);
  return request.then((response) => checkHarnessDeployResponse(response.status, response.data));
}

export function watchDeployment(api_url, harness_api_key, options={}) {
  const { waitBetween } = Object.assign({ waitBetween: 10 }, options);
  const retry_statuses = [408, 429, 503];
  const client = axios.create({
    maxRedirects: 0,
    headers: { 'X-Api-Key': harness_api_key }
  });
  function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
  }
  function poll() {
    return client.get(api_url).then(
      (fulfillment) => {
        switch(fulfillment.data.status) {
          case 'RUNNING':
          case 'QUEUED':
            return sleep(waitBetween).then(poll);
          case 'SUCCESS':
            return '🎉 Deployment succeeded'
          case 'ABORTED':
            return Promise.reject('🛑 Deployment was aborted or cancelled');
          case 'REJECTED':
            return Promise.reject('🛑 Deployment was rejected');
          case 'FAILED':
            return Promise.reject('💣 Deployment has failed. Check the Harness link for more details and see https://www.notion.so/freeagent/Deployment-failures-8ef5762f707944a4b880a8970cf16132 for help identifying the issue.');
          default:
            return Promise.reject(`Unknown status from Harness: ${fulfillment.data.status}. Please check deployment link to see what happened and confirm everything's ok.`);
        }
      },
      (rejection) => {
        if ( retry_statuses.includes(rejection.response.status) ) {
          return sleep(waitBetween).then(poll);
        }
        return Promise.reject(`Unexpected HTTP status ${rejection.response.status}`);
      }
    )
  }
  return poll();
}
