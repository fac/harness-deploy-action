const axios = require('axios').default;

let checkHarnessDeployResponse = function(statusCode, data) {
  console.log(statusCode, data);

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
      resolve({
        harness_url,
        api_url,
        messages: [info_message, `Harness deploy submitted, view at ${harness_url}`],
      });
    } else {
      if ( error ) {
        reject({
          error,
          message: `💣 Failed to start deployment: ${error}`,
        });
      } else {
        reject({
          error,
          message: `💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`,
         });
      }
    }
  });
}

let makeHarnessDeployRequestPayload = function(application, version, services) {
  const artifacts = services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: version } });

  return JSON.stringify({
    application,
    artifacts
  }, undefined, 2);
}

let axiosConfig = {
  headers: {
      'Content-Type': 'application/json;charset=UTF-8'
  }
};

let sendHarnessDeployRequest = function(webhookUrl, application, version, services) {
  const request_body = makeHarnessDeployRequestPayload(application, version, services);
  const request = axios.post(webhookUrl, request_body, axiosConfig);

  return request.then((response) => checkHarnessDeployResponse(response.status, response.data));
}

module.exports = {checkHarnessDeployResponse, makeHarnessDeployRequestPayload, sendHarnessDeployRequest};