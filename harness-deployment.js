const core = require('@actions/core');
const github = require('@actions/github');

class HarnessDeployment {
    constructor(webhookUrl, application, version, services) {
        this.webhookUrl = webhookUrl,
        this.application = application,
        this.version = version,
        this.services = services
    }

    start() {
        console.log(`Deploying application:${this.application} (${this.services}) at ${this.version}`)
        this.makeRequest();
    }

    makeRequest() {
        var request = new XMLHttpRequest();
        request.open('POST', this.webhookUrl, false);  // `false` makes the request synchronous
        request.setRequestHeader('Content-Type', 'application/json',);
        request.send(this.payload());

        console.log(`BODY:${request.responseText}`);
        this.do_the_response(request.status, JSON.parse(request.responseText));
    }

    payload() {
        const art = this.services.split(/\s*,\s*/).map(x => { return { service: x, buildNumber: this.version } });

        return JSON.stringify({
            application: this.application,
            artifacts: art
        }, undefined, 2)
    }

    do_the_response(statusCode, data) {
        const { uiUrl, error } = data;
        core.setOutput("harness_url", uiUrl);
        core.setOutput("error", error);

        const request_success = [200, 201, 400].includes(statusCode);
        const deploy_success = ['QUEUED', 'RUNNING', 'PAUSED'].includes(data.status);

        if (request_success && deploy_success) {
            if (data.status == 'PAUSED') {
                core.info("⚠️ Waiting for approval to start the deployment pipeline on Harness")
            } else {
                core.info("🚀 Deployment pipeline is now running on Harness")
            }
            core.info(`Harness deploy submitted, view at ${uiUrl}`)
        } else {
            if (error) {
                core.error(`💣 Failed to start deployment: ${error}`)
            } else {
                core.error(`💣 Deployment pipeline state is ${data.status}, check the health through the Harness website.`)
            }

            core.setFailed(error || 'Unknown');
        }
    }
}

module.exports = HarnessDeployment;
